import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';

const router = express.Router();

// API version and status
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERN Backend API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

export default router;
