// src/controllers/orderController.js
import prisma from '../db.js';
import { randomUUID } from 'crypto';

// Helper function to calculate commission based on category rules
const calculateCommission = async (product, quantity) => {
  // Fetch active commission rule for this category
  const commissionRule = await prisma.commissionRule.findFirst({
    where: {
      categoryId: product.categoryId,
      activeFromDate: { lte: new Date() },
      OR: [
        { activeToDate: null },
        { activeToDate: { gte: new Date() } },
      ],
    },
    orderBy: { activeFromDate: 'desc' },
  });

  if (!commissionRule) {
    throw new Error(`No active commission rule found for category ${product.categoryId}`);
  }

  const itemTotal = product.basePrice * quantity;

  const percentageFee = (itemTotal * commissionRule.commissionPercentage) / 100;
  const totalCommission = percentageFee + commissionRule.fixedFee;

  return {
    itemTotal,
    commissionPercentage: commissionRule.commissionPercentage,
    fixedFee: commissionRule.fixedFee,
    totalCommission,
    netAmount: itemTotal - totalCommission,
    commissionRuleId: commissionRule.id,
  };
};

// Create order from cart items
export const createOrder = async (req, res) => {
  const { shippingAddressId, shippingAddress } = req.body;

  if (!shippingAddressId && !shippingAddress) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  try {
    // Get user's cart items with full product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                category: true,
                seller: true,
              },
            },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let finalAddressId = shippingAddressId;

    if (shippingAddress) {
      // Create new address
      const newAddress = await prisma.address.create({
        data: {
          userId: req.user.userId,
          streetAddress: shippingAddress.addressLine1 + (shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''),
          city: shippingAddress.city || 'Unknown',
          state: shippingAddress.state || 'Unknown',
          pincode: shippingAddress.pincode || '000000',
          country: 'India',
          addressType: 'HOME',
        }
      });
      finalAddressId = newAddress.id;
    } else {
      // Verify shipping address belongs to user
      const address = await prisma.address.findUnique({
        where: { id: shippingAddressId },
      });

      if (!address || address.userId !== req.user.userId) {
        return res.status(404).json({ error: 'Shipping address not found' });
      }
    }

    // Group cart items by seller
    const itemsBySeller = {};
    for (const item of cartItems) {
      const sellerId = item.productVariant.product.sellerId;
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push(item);
    }

    // Generate a group ID for multi-seller orders
    const groupId = Object.keys(itemsBySeller).length > 1 ? randomUUID() : null;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const createdOrders = [];

      // Create separate order for each seller
      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        // Check stock availability for all items
        for (const item of items) {
          if (item.productVariant.stockQuantity < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.productVariant.product.name} (Batch: ${item.productVariant.batchNumber})`
            );
          }
        }

        // Calculate order totals and commission
        let totalAmount = 0;
        let totalCommission = 0;
        let commissionRuleId = null;

        const orderItemsData = [];

        for (const item of items) {
          const commission = await calculateCommission(
            item.productVariant.product,
            item.quantity
          );

          totalAmount += commission.itemTotal;
          totalCommission += commission.totalCommission;
          
          // Store the first commission rule ID (all items in same order should use same rule)
          if (!commissionRuleId) {
            commissionRuleId = commission.commissionRuleId;
          }

          orderItemsData.push({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: item.productVariant.product.basePrice,
            lineTotal: commission.itemTotal,
          });
        }

        // Create order
        const order = await tx.order.create({
          data: {
            buyerId: req.user.userId,
            shippingAddressId: finalAddressId,
            totalAmount,
            paymentMethod: 'COD', // Default for now
            status: 'PENDING_CONFIRMATION',
            groupId,
            orderItems: {
              create: orderItemsData,
            },
          },
          include: {
            orderItems: {
              include: {
                productVariant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        });

        // Create shipment
        await tx.shipment.create({
          data: {
            orderId: order.id,
            status: 'PENDING_PICKUP',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });

        // Create payout record
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days after order
        await tx.payout.create({
          data: {
            sellerId,
            orderId: order.id,
            grossAmount: totalAmount,
            commissionRuleAppliedId: commissionRuleId,
            platformFeeDeducted: totalCommission,
            netPayable: totalAmount - totalCommission,
            status: 'PENDING',
            dueDate,
          },
        });

        // Deduct stock using FIFO (oldest batch first)
        for (const item of items) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        createdOrders.push(order);
      }

      // Clear cart after successful order
      await tx.cartItem.deleteMany({
        where: { userId: req.user.userId },
      });

      return createdOrders;
    });

    res.status(201).json({
      message: 'Order created successfully',
      orders: result,
      groupId,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Could not create order' });
  }
};

// Get user's orders
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user.userId },
      include: {
        orderItems: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    seller: {
                      select: {
                        locationVillage: true,
                        user: { select: { email: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
        shipment: true,
      },
      orderBy: { orderDate: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
};

// Get single order details
export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    category: true,
                    seller: {
                      include: {
                        user: { select: { email: true, phoneNumber: true } },
                      },
                    },
                  },
                },
                authenticitySteps: {
                  orderBy: { timestamp: 'asc' },
                },
              },
            },
          },
        },
        shippingAddress: true,
        shipment: true,
        buyer: {
          select: { email: true, phoneNumber: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order
    if (order.buyerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Could not fetch order' });
  }
};

// Get seller's orders (Seller only)
export const getSellerOrders = async (req, res) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Get all orders containing this seller's products
    const orders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            productVariant: {
              product: {
                sellerId: seller.id,
              },
            },
          },
        },
      },
      include: {
        orderItems: {
          where: {
            productVariant: {
              product: {
                sellerId: seller.id,
              },
            },
          },
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
        shippingAddress: true,
        shipment: true,
        buyer: {
          select: { email: true, phoneNumber: true },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
};

// Update order status (Seller only)
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Verify seller owns products in this order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const sellerOwnsOrder = order.orderItems.every(
      (item) => item.productVariant.product.sellerId === seller.id
    );

    if (!sellerOwnsOrder) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
        shipment: true,
      },
    });

    // Update shipment status if order is shipped/delivered
    if (status === 'SHIPPED') {
      await prisma.shipment.update({
        where: { orderId: id },
        data: { status: 'IN_TRANSIT' },
      });
    } else if (status === 'DELIVERED') {
      await prisma.shipment.update({
        where: { orderId: id },
        data: {
          status: 'DELIVERED',
          actualDelivery: new Date(),
        },
      });
    }

    res.json({
      message: 'Order status updated',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Could not update order' });
  }
};