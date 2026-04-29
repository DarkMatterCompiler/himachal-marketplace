// src/controllers/payoutController.js
import prisma from '../db.js';

// Get seller's payouts
export const getSellerPayouts = async (req, res) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const payouts = await prisma.payout.findMany({
      where: { sellerId: seller.id },
      include: {
        order: {
          select: {
            id: true,
            orderDate: true,
            groupId: true,
          },
        },
        commissionRule: {
          select: {
            commissionPercentage: true,
            fixedFee: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payouts });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Could not fetch payouts' });
  }
};

// Get single payout details
export const getPayoutById = async (req, res) => {
  const { id } = req.params;

  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const payout = await prisma.payout.findUnique({
      where: { id },
      include: {
        order: {
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
          },
        },
        commissionRule: true,
        seller: {
          select: {
            locationVillage: true,
            bankAccountNumber: true,
            ifscCode: true,
            user: {
              select: { email: true, phoneNumber: true },
            },
          },
        },
      },
    });

    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    // Verify payout belongs to this seller
    if (payout.sellerId !== seller.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ payout });
  } catch (error) {
    console.error('Error fetching payout:', error);
    res.status(500).json({ error: 'Could not fetch payout' });
  }
};

// Admin: Get all pending payouts
export const getAllPendingPayouts = async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({
      where: { status: 'PENDING' },
      include: {
        seller: {
          select: {
            locationVillage: true,
            bankAccountNumber: true,
            ifscCode: true,
            user: {
              select: { email: true, phoneNumber: true },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderDate: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ payouts });
  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    res.status(500).json({ error: 'Could not fetch payouts' });
  }
};

// Admin: Approve payout
export const approvePayout = async (req, res) => {
  const { id } = req.params;
  const { paymentReference } = req.body;

  try {
    const payout = await prisma.payout.findUnique({
      where: { id },
    });

    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    if (payout.status !== 'PENDING') {
      return res.status(400).json({ error: 'Payout is not pending' });
    }

    const updatedPayout = await prisma.payout.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentReference,
        paidAt: new Date(),
      },
    });

    res.json({
      message: 'Payout approved successfully',
      payout: updatedPayout,
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    res.status(500).json({ error: 'Could not approve payout' });
  }
};

// Admin: Bulk approve payouts
export const bulkApprovePayout = async (req, res) => {
  const { payoutIds, paymentReference } = req.body;

  if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
    return res.status(400).json({ error: 'Invalid payout IDs' });
  }

  try {
    const result = await prisma.payout.updateMany({
      where: {
        id: { in: payoutIds },
        status: 'PENDING',
      },
      data: {
        status: 'PAID',
        paymentReference,
        paidAt: new Date(),
      },
    });

    res.json({
      message: `${result.count} payouts approved successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error bulk approving payouts:', error);
    res.status(500).json({ error: 'Could not approve payouts' });
  }
};
