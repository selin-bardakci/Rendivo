import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Service, Business } from '../models';
import { getAllPredefinedServices, getServicesForCategory } from '../constants/serviceTypes';
import { Op } from 'sequelize';

// Get all unique service names (predefined + custom "Other" services) - Public
export const getAllUniqueServices = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { businessType } = req.query;
    
    // Get predefined services based on category
    let predefinedServices: string[];
    if (businessType && typeof businessType === 'string') {
      // Get services for specific category (excluding "Other")
      predefinedServices = getServicesForCategory(businessType).filter(s => s !== 'Other');
    } else {
      // Get all predefined services if no category specified
      predefinedServices = getAllPredefinedServices();
    }
    
    // Build where clause for custom services
    const whereClause: any = {
      isActive: true,
      name: {
        [Op.notIn]: [...predefinedServices, 'Other'] // Exclude both predefined and "Other"
      }
    };
    
    // Get unique custom service names from database (where service is not in predefined list)
    const customServices = await Service.findAll({
      attributes: ['name'],
      where: whereClause,
      include: businessType && typeof businessType === 'string' ? [{
        model: Business,
        as: 'business',
        attributes: [],
        where: { 
          businessType: businessType as string,
          isActive: true,
          approvalStatus: 'approved'
        },
        required: true
      }] : [],
      group: ['Service.name'],
      raw: true
    });

    const customServiceNames = customServices.map((s: any) => s.name);
    
    // Combine predefined and custom services
    const allServices = [...predefinedServices, ...customServiceNames].sort();
    
    res.json(allServices);
  } catch (error: any) {
    console.error('Get all unique services error:', error);
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

// Get available service types for business owner's category (predefined + custom) - Protected
export const getAvailableServiceTypes = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find business owned by this user
    const business = await Business.findOne({ 
      where: { ownerId: userId, isActive: true },
      attributes: ['id', 'businessType']
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const businessType = business.businessType;
    
    if (!businessType) {
      return res.status(400).json({ message: 'Business type not set' });
    }
    
    // Get predefined services for this category (excluding "Other")
    const predefinedServices = getServicesForCategory(businessType).filter(s => s !== 'Other');
    
    // Get unique custom service names from other businesses in same category
    const customServices = await Service.findAll({
      attributes: ['name'],
      where: {
        isActive: true,
        name: {
          [Op.notIn]: [...predefinedServices, 'Other']
        }
      },
      include: [{
        model: Business,
        as: 'business',
        attributes: [],
        where: { 
          businessType: businessType,
          isActive: true,
          approvalStatus: 'approved'
        },
        required: true
      }],
      group: ['Service.name'],
      raw: true
    });

    const customServiceNames = customServices.map((s: any) => s.name);
    
    // Combine predefined, custom, and "Other" at the end
    const allServices = [...predefinedServices, ...customServiceNames, 'Other'].sort((a, b) => {
      // Keep "Other" at the end
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });
    
    res.json(allServices);
  } catch (error: any) {
    console.error('Get available service types error:', error);
    res.status(500).json({ message: 'Error fetching service types', error: error.message });
  }
};

// Get all services for a business
export const getBusinessServices = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { businessId } = req.params;

    const services = await Service.findAll({
      where: { 
        businessId,
        isActive: true 
      },
      order: [['name', 'ASC']],
    });

    res.json(services);
  } catch (error: any) {
    console.error('Get business services error:', error);
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

// Get services for logged-in business owner
export const getOwnerServices = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find business owned by this user
    const business = await Business.findOne({ where: { ownerId: userId } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const services = await Service.findAll({
      where: { 
        businessId: business.id,
      },
      order: [['name', 'ASC']],
    });

    res.json(services);
  } catch (error: any) {
    console.error('Get owner services error:', error);
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

// Create a new service (Business owner only)
export const createService = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { name, description, price, duration } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find business owned by this user
    const business = await Business.findOne({ where: { ownerId: userId } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const service = await Service.create({
      businessId: business.id,
      name,
      description,
      price,
      duration,
      isActive: true,
    });

    res.status(201).json({
      message: 'Service created successfully',
      service,
    });
  } catch (error: any) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Error creating service', error: error.message });
  }
};

// Update a service (Business owner only)
export const updateService = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, isActive } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const service = await Service.findByPk(id, {
      include: [{
        model: Business,
        as: 'business',
      }],
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user owns the business
    const business = await Business.findOne({ where: { ownerId: userId } });
    if (!business || business.id !== service.businessId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this business' });
    }

    await service.update({
      name,
      description,
      price,
      duration,
      isActive,
    });

    res.json({
      message: 'Service updated successfully',
      service,
    });
  } catch (error: any) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Error updating service', error: error.message });
  }
};

// Delete a service (Business owner only)
export const deleteService = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user owns the business
    const business = await Business.findOne({ where: { ownerId: userId } });
    if (!business || business.id !== service.businessId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this business' });
    }

    await service.destroy();

    res.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
};
