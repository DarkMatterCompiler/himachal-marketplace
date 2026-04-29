import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticateToken, requireSeller } from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// Seller routes
router.get('/seller/orders', requireSeller, getSellerOrders);
router.patch('/:id/status', requireSeller, updateOrderStatus);

// Buyer routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;