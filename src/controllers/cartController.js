// src/controllers/cartController.js
import prisma from '../db.js';

// Get user's cart with product details
export const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                category: true,
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
      orderBy: { addedAt: 'desc' },
    });

    // Calculate cart totals
    const summary = {
      itemCount: cartItems.length,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartItems.reduce(
        (sum, item) => sum + item.productVariant.product.basePrice * item.quantity,
        0
      ),
    };

    res.json({ cart: cartItems, summary });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Could not fetch cart' });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  const { productVariantId, productId, quantity } = req.body;

  if ((!productVariantId && !productId) || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid product/variant or quantity' });
  }

  try {
    let variant;

    // If productId is provided instead of productVariantId, get the first available variant (FIFO)
    if (productId && !productVariantId) {
      variant = await prisma.productVariant.findFirst({
        where: {
          productId: productId,
          stockQuantity: { gt: 0 },
        },
        orderBy: { manufacturingDate: 'asc' }, // FIFO - oldest first
        include: {
          product: true,
        },
      });

      if (!variant) {
        return res.status(404).json({ error: 'No available stock for this product' });
      }
    } else {
      // Check if variant exists and has enough stock
      variant = await prisma.productVariant.findUnique({
        where: { id: productVariantId },
        include: {
          product: true,
        },
      });

      if (!variant) {
        return res.status(404).json({ error: 'Product variant not found' });
      }
    }

    if (variant.stockQuantity < quantity) {
      return res.status(400).json({
        error: `Only ${variant.stockQuantity} units available`,
        availableStock: variant.stockQuantity,
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productVariantId: {
          userId: req.user.userId,
          productVariantId: variant.id,
        },
      },
    });

    let cartItem;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (variant.stockQuantity < newQuantity) {
        return res.status(400).json({
          error: `Only ${variant.stockQuantity} units available`,
          currentInCart: existingItem.quantity,
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          productVariant: {
            include: {
              product: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.userId,
          productVariantId: variant.id,
          quantity,
        },
        include: {
          productVariant: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    res.status(201).json({
      message: 'Item added to cart',
      cartItem,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Could not add item to cart' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  try {
    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        productVariant: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check stock availability
    if (cartItem.productVariant.stockQuantity < quantity) {
      return res.status(400).json({
        error: `Only ${cartItem.productVariant.stockQuantity} units available`,
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      message: 'Cart updated',
      cartItem: updatedItem,
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Could not update cart item' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Could not remove item' });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.userId },
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Could not clear cart' });
  }
};
