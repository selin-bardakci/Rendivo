import express from 'express';
import authRoutes from './auth';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

export default router;
