import express from 'express';
import { 
  createSellerProfile, 
  getSellerProfile, 
  getOwnSellerProfile, 
  updateSellerProfile 
} from '../controllers/sellerController.js';
import { authenticateToken, requireSeller } from '../middleware/auth.js';

const router = express.Router();

// Authenticated routes (specific routes before parameterized)
router.post('/', authenticateToken, requireSeller, createSellerProfile);
router.get('/profile', authenticateToken, requireSeller, getOwnSellerProfile);
router.patch('/profile', authenticateToken, requireSeller, updateSellerProfile);

// Public routes (parameterized route last)
router.get('/:id', getSellerProfile);

export default router;