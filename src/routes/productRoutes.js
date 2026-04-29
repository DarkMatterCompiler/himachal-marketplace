import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  getSellerProducts,
  updateProduct,
  deleteProduct,
  updateProductStock 
} from '../controllers/productController.js';
import { authenticateToken, requireSeller } from '../middleware/auth.js';

const router = express.Router();

// Public routes (order matters - specific before parameterized)
router.get('/', getProducts);

// Seller-only routes (must come before /:id to avoid route conflicts)
router.get('/seller/products', authenticateToken, requireSeller, getSellerProducts);
router.post('/', authenticateToken, requireSeller, createProduct);
router.patch('/:id', authenticateToken, requireSeller, updateProduct);
router.delete('/:id', authenticateToken, requireSeller, deleteProduct);
router.patch('/:variantId/stock', authenticateToken, requireSeller, updateProductStock);

// Public route with parameter (must come last)
router.get('/:id', getProductById);

export default router;
