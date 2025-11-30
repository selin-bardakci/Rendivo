import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Business, User, StaffMember, Service } from '../models';
import { Op } from 'sequelize';

// Get all active businesses (for discover page)
export const getAllBusinesses = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { search, services } = req.query;

    const whereClause: any = {
      isActive: true,
    };

    // Search by business name or type
    if (search && typeof search === 'string') {
      whereClause[Op.or] = [
        { businessName: { [Op.like]: `%${search}%` } },
        { businessType: { [Op.like]: `%${search}%` } },
      ];
    }

    const businesses = await Business.findAll({
      where: whereClause,
      attributes: ['id', 'businessId', 'businessName', 'businessType', 'address', 'city', 'state', 'phone', 'email', 'logo'],
      include: [
        {
          model: Service,
          as: 'services',
          where: { isActive: true },
          attributes: ['id', 'name', 'price', 'duration'],
          required: false,
        },
      ],
      order: [['businessName', 'ASC']],
    });

    // Filter by services if provided
    let filteredBusinesses = businesses;
    if (services && typeof services === 'string') {
      const serviceNames = services.split(',').map(s => s.trim().toLowerCase());
      filteredBusinesses = businesses.filter(business => {
        const businessServices = (business as any).services || [];
        return businessServices.some((service: any) =>
          serviceNames.some(name => service.name.toLowerCase().includes(name))
        );
      });
    }

    res.json(filteredBusinesses);
  } catch (error: any) {
    console.error('Get all businesses error:', error);
    res.status(500).json({ message: 'Error fetching businesses', error: error.message });
  }
};

// Get business by ID with details
export const getBusinessById = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id, {
      attributes: ['id', 'businessId', 'businessName', 'businessType', 'description', 'address', 'city', 'state', 'zipCode', 'phone', 'email', 'website', 'logo'],
      include: [
        {
          model: Service,
          as: 'services',
          where: { isActive: true },
          attributes: ['id', 'name', 'description', 'price', 'duration'],
          required: false,
        },
        {
          model: StaffMember,
          as: 'staff',
          where: { isActive: true },
          attributes: ['id', 'position', 'userId', 'businessId', 'isActive', 'joinedAt'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'fullName', 'email', 'phone'],
            },
          ],
          required: false,
        },
      ],
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (error: any) {
    console.error('Get business by ID error:', error);
    res.status(500).json({ message: 'Error fetching business', error: error.message });
  }
};

// Get staff for a business
export const getBusinessStaff = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { businessId } = req.params;

    const staff = await StaffMember.findAll({
      where: {
        businessId,
        isActive: true,
      },
      attributes: ['id', 'position', 'userId', 'businessId', 'isActive', 'joinedAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'fullName', 'email', 'phone'],
        },
      ],
    });

    res.json(staff);
  } catch (error: any) {
    console.error('Get business staff error:', error);
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};
