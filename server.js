import express from 'express';
import morgan from 'morgan';
import userRoutes from './src/routes/userRoutes.js';
import sellerRoutes from './src/routes/sellerRoutes.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(morgan('dev'));
app.use(express.json()); 

// Routes
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);


app.get('/', (req, res) => {
  res.send({ message: "Welcome to the Himachal Marketplace API!" });
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});