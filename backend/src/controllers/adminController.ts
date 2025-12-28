import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Business, User } from '../models';
import { ApprovalStatus } from '../models/Business';

// Get all pending business approvals
export const getPendingBusinesses = async (_req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const businesses = await Business.findAll({
      where: {
        approvalStatus: ApprovalStatus.PENDING,
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'fullName', 'phone', 'createdAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(businesses);
  } catch (error: any) {
    console.error('Get pending businesses error:', error);
    res.status(500).json({ message: 'Error fetching pending businesses', error: error.message });
  }
};

// Get all businesses with filters
export const getAllBusinessesAdmin = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { status } = req.query;

    const whereClause: any = {};
    if (status && typeof status === 'string') {
      whereClause.approvalStatus = status;
    }

    const businesses = await Business.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'fullName', 'phone', 'createdAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(businesses);
  } catch (error: any) {
    console.error('Get all businesses admin error:', error);
    res.status(500).json({ message: 'Error fetching businesses', error: error.message });
  }
};

// Approve a business
export const approveBusiness = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'fullName'],
        },
      ],
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.approvalStatus !== ApprovalStatus.PENDING) {
      return res.status(400).json({ message: `Business is already ${business.approvalStatus}` });
    }

    await business.update({
      approvalStatus: ApprovalStatus.APPROVED,
      approvedAt: new Date(),
      rejectionReason: undefined,
    });

    // Send approval notification + email to business owner
    try {
      const { notificationService } = await import('../services/notificationService');
      const owner = (business as any).owner;
      
      await notificationService.sendNotification({
        userId: owner.id.toString(),
        type: 'business_approved',
        title: '🎉 Business Approved!',
        message: `Congratulations! Your business "${business.businessName}" has been approved and is now live!`,
        relatedId: business.id.toString(),
        relatedType: 'business',
        actionUrl: '/business/dashboard',
        emailData: {
          to: owner.email,
          subject: '🎉 Your Business Has Been Approved!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333; border-bottom: 3px solid #28a745; padding-bottom: 10px;">🎉 Congratulations!</h2>
              <p style="color: #555; line-height: 1.6;">Hello ${owner.fullName}! 👋</p>
              <p style="color: #555; line-height: 1.6;">Great news! Your business application has been <strong style="color: #28a745;">approved</strong>! 🌟</p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <p style="margin: 5px 0;"><strong>🏢 Business Name:</strong> ${business.businessName}</p>
                <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${business.city}, ${business.state}</p>
                <p style="margin: 5px 0;"><strong>✨ Status:</strong> <span style="color: #28a745; font-weight: bold;">APPROVED</span></p>
              </div>
              <p style="color: #555; line-height: 1.6;">Your business is now live on our platform! You can start:</p>
              <ul style="color: #555; line-height: 1.6;">
                <li>Adding services and staff members</li>
                <li>Managing your schedule</li>
                <li>Accepting appointments from customers</li>
                <li>Growing your business! 🚀</li>
              </ul>
              <p style="color: #555; line-height: 1.6;">We're excited to have you on board! Let's make your business thrive! 💙</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Welcome to the community! 🎊</p>
            </div>
          `
        }
      });
    } catch (notifError) {
      console.error('Failed to send approval notification:', notifError);
    }

    res.json({
      message: 'Business approved successfully',
      business,
    });
  } catch (error: any) {
    console.error('Approve business error:', error);
    res.status(500).json({ message: 'Error approving business', error: error.message });
  }
};

// Reject a business
export const rejectBusiness = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const business = await Business.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'fullName'],
        },
      ],
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (business.approvalStatus !== ApprovalStatus.PENDING) {
      return res.status(400).json({ message: `Business is already ${business.approvalStatus}` });
    }

    await business.update({
      approvalStatus: ApprovalStatus.REJECTED,
      rejectionReason: reason,
      isActive: false,
    });

    const owner = (business as any).owner;

    // Deactivate user account (don't delete - allow reapplication)
    try {
      await User.update(
        { isActive: false },
        { where: { id: owner.id } }
      );
      console.log('✅ Deactivated rejected business owner account:', owner.email);
    } catch (updateError) {
      console.error('Failed to deactivate business owner account:', updateError);
    }

    // Send rejection email to business owner
    try {
      const EmailService = (await import('../services/emailService')).default;
      await EmailService.sendEmail({
        to: owner.email,
        subject: '❌ Business Application Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333; border-bottom: 3px solid #dc3545; padding-bottom: 10px;">❌ Application Decision</h2>
            <p style="color: #555; line-height: 1.6;">Hello ${owner.fullName},</p>
            <p style="color: #555; line-height: 1.6;">Thank you for your interest in joining our platform. After careful review, we're unable to approve your business application at this time.</p>
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <p style="margin: 5px 0;"><strong>🏢 Business Name:</strong> ${business.businessName}</p>
              <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${business.city}, ${business.state}</p>
              <p style="margin: 5px 0;"><strong>❌ Status:</strong> <span style="color: #dc3545; font-weight: bold;">REJECTED</span></p>
            </div>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>📝 Reason:</strong></p>
              <p style="margin: 10px 0 0 0; color: #555;">${reason}</p>
            </div>
            <p style="color: #555; line-height: 1.6;">Your account has been temporarily deactivated. You may reapply with updated information after addressing the concerns mentioned above.</p>
            <p style="color: #555; line-height: 1.6;">If you have questions or need clarification, please feel free to contact our support team.</p>
            <p style="color: #555; line-height: 1.6;">We appreciate your understanding and wish you the best! 💙</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">You can reapply anytime with improved information.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.json({
      message: 'Business rejected successfully',
      business,
    });
  } catch (error: any) {
    console.error('Reject business error:', error);
    res.status(500).json({ message: 'Error rejecting business', error: error.message });
  }
};

// Get business details (admin view)
export const getBusinessDetails = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'fullName', 'phone', 'createdAt', 'lastLogin'],
        },
      ],
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (error: any) {
    console.error('Get business details error:', error);
    res.status(500).json({ message: 'Error fetching business details', error: error.message });
  }
};

// Get dashboard stats for admin
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const totalBusinesses = await Business.count();
    const pendingBusinesses = await Business.count({
      where: { approvalStatus: ApprovalStatus.PENDING },
    });
    const approvedBusinesses = await Business.count({
      where: { approvalStatus: ApprovalStatus.APPROVED },
    });
    const rejectedBusinesses = await Business.count({
      where: { approvalStatus: ApprovalStatus.REJECTED },
    });

    const totalUsers = await User.count();
    const totalCustomers = await User.count({
      where: { role: 'customer' },
    });
    const totalStaff = await User.count({
      where: { role: 'staff' },
    });

    res.json({
      businesses: {
        total: totalBusinesses,
        pending: pendingBusinesses,
        approved: approvedBusinesses,
        rejected: rejectedBusinesses,
      },
      users: {
        total: totalUsers,
        customers: totalCustomers,
        staff: totalStaff,
      },
    });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
  }
};
