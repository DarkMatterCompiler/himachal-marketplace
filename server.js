import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
import sellerRoutes from './src/routes/sellerRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import payoutRoutes from './src/routes/payoutRoutes.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4000', 'http://localhost:3000'], // Frontend URL
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json()); 

// Routes
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payouts', payoutRoutes);

app.get('/', (req, res) => {
  res.send({ message: "Welcome to the Himachal Marketplace API!" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on http://localhost:${PORT}`);
});