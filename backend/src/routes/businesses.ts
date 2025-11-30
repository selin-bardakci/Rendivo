import express from 'express';
import {
  getAllBusinesses,
  getBusinessById,
  getBusinessStaff,
} from '../controllers/businessController';

const router = express.Router();

// Public routes
router.get('/businesses', getAllBusinesses);
router.get('/businesses/:id', getBusinessById);
router.get('/businesses/:businessId/staff', getBusinessStaff);

export default router;
