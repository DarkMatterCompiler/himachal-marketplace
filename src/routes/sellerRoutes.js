import express from 'express';
import { createSellerProfile, getSellerProfile } from '../controllers/sellerController.js';

const router = express.Router();

router.post('/onboard', createSellerProfile);
router.get('/:id', getSellerProfile);

export default router;