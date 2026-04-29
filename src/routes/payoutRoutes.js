// src/routes/payoutRoutes.js
import express from 'express';
import {
  getSellerPayouts,
  getPayoutById,
  getAllPendingPayouts,
  approvePayout,
  bulkApprovePayout,
} from '../controllers/payoutController.js';
import { authenticateToken, requireSeller, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Seller routes
router.get('/seller', authenticateToken, requireSeller, getSellerPayouts);
router.get('/:id', authenticateToken, getPayoutById);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllPendingPayouts);
router.patch('/:id/approve', authenticateToken, requireAdmin, approvePayout);
router.post('/bulk-approve', authenticateToken, requireAdmin, bulkApprovePayout);

export default router;
