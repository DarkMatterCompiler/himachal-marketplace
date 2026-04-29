// src/controllers/sellerController.js
import prisma from '../db.js';

export const createSellerProfile = async (req, res) => {
  const { bio, locationVillage, bankAccountNumber, ifscCode, sellerType, taxId } = req.body;

  // Use authenticated user's ID
  const userId = req.user.userId;

  // Validation
  if (!bio || !locationVillage || !bankAccountNumber || !ifscCode || !sellerType) {
    return res.status(400).json({ 
      error: 'bio, locationVillage, bankAccountNumber, ifscCode, and sellerType are required' 
    });
  }

  if (!['FARMER', 'ARTISAN', 'CRAFTSMAN'].includes(sellerType.toUpperCase())) {
    return res.status(400).json({ error: 'sellerType must be FARMER, ARTISAN, or CRAFTSMAN' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.userType.toUpperCase() !== 'SELLER') {
      return res.status(403).json({ error: 'Only users with SELLER account type can create seller profile' });
    }

    const existingProfile = await prisma.seller.findUnique({ where: { userId: userId } });
    if (existingProfile) {
      return res.status(400).json({ error: 'Seller profile already exists for this user' });
    }

    const newProfile = await prisma.seller.create({
      data: {
        bio,
        locationVillage,
        bankAccountNumber,
        ifscCode,
        sellerType: sellerType.toUpperCase(),
        taxId,
        userId,
      },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            userType: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Seller profile created successfully',
      seller: newProfile,
    });
  } catch (error) {
    console.error('Error creating seller profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




export const getSellerProfile = async (req, res) => {
  const { id } = req.params; // We will pass the Seller ID in the URL

  try {
    const seller = await prisma.seller.findUnique({
      where: { id: id },
      //  THE MAGIC PART: JOIN Logic
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            userType: true,
            createdAt: true
            // We do NOT select 'password' here for security!
          }
        }
      }
    });

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    res.json({ seller });

  } catch (error) {
    console.error('Error fetching seller profile:', error);
    res.status(500).json({ error: "Could not fetch profile" });
  }
};

// Get authenticated seller's own profile
export const getOwnSellerProfile = async (req, res) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            userType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found. Please complete onboarding first.' });
    }

    res.json({ seller });
  } catch (error) {
    console.error('Error fetching own seller profile:', error);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
};

// Update seller profile
export const updateSellerProfile = async (req, res) => {
  const { bio, locationVillage, bankAccountNumber, ifscCode, sellerType, taxId } = req.body;

  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: seller.id },
      data: {
        ...(bio && { bio }),
        ...(locationVillage && { locationVillage }),
        ...(bankAccountNumber && { bankAccountNumber }),
        ...(ifscCode && { ifscCode }),
        ...(sellerType && { sellerType: sellerType.toUpperCase() }),
        ...(taxId && { taxId }),
      },
      include: {
        user: {
          select: {
            email: true,
            phoneNumber: true,
            userType: true,
          },
        },
      },
    });

    res.json({
      message: 'Seller profile updated successfully',
      seller: updatedSeller,
    });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};