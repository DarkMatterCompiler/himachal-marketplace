// src/controllers/sellerController.js
import prisma from '../db.js';

export const createSellerProfile = async (req , res) => {
    const { userId, bio, location, bankAccount, taxId } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if(!user || user.userType.toUpperCase() !== 'SELLER') {
            return res.status(404).json({ error: 'Seller user not found' });
        }

        const existingProfile = await prisma.seller.findUnique({ where: { userId: userId } });
        if(existingProfile) {
            return res.status(400).json({ error: 'Seller profile already exists for this user' });
        }

        const newProfile = await prisma.seller.create({
            data: {
                bio,
                location,
                bankAccount,
                taxId,
                userId // This Foreign Key links the tables!
            }
        });

        res.status(201).json({
            message: 'Seller profile created successfully',
            profile: newProfile
        });

    } catch (error) {
        console.error('Error creating seller profile:', error);
        res.status(500).json({ error: 'Internal server error no profile created' });   
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

    res.json(seller);

  } catch (error) {
    res.status(500).json({ error: "Could not fetch profile" });
  }
};