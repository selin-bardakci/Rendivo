import express from 'express';
import {
  getAllBusinesses,
  getBusinessById,
  getBusinessStaff,
  getBusinessDashboard,
  getMyBusiness,
  removeStaffMember,
} from '../controllers/businessController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/businesses', getAllBusinesses);
router.get('/businesses/:id', getBusinessById);
router.get('/businesses/:businessId/staff', getBusinessStaff);

// Protected routes (for business owners)
router.get('/business/dashboard', authenticate, getBusinessDashboard);
router.get('/business/my-business', authenticate, getMyBusiness); // Returns owner's business info
router.get('/business/staff', authenticate, getBusinessStaff); // Get owner's business staff
router.delete('/business/staff/:staffId', authenticate, removeStaffMember); // Remove staff member

export default router;
