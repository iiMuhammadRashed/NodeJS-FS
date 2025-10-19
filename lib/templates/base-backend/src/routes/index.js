import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';

const router = express.Router();


router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERN Backend API v1',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});


router.use('/auth', authRoutes);
router.use('/products', productRoutes);

export default router;
