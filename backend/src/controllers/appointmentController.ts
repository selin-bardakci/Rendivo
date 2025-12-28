import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import { Appointment, Service, Business, StaffMember, User, AppointmentService } from '../models';
import { AppointmentStatus } from '../models/Appointment';
import { notificationService } from '../services/notificationService';

// Create a new appointment
export const createAppointment = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { businessId, staffId, serviceIds, appointmentDate, startTime, notes } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate required fields
    if (!businessId || !staffId || !serviceIds || !appointmentDate || !startTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch services to calculate total price and duration
    const services = await Service.findAll({
      where: {
        id: serviceIds,
        businessId,
        isActive: true,
      },
    });

    if (services.length !== serviceIds.length) {
      return res.status(400).json({ message: 'Some services not found or inactive' });
    }

    const totalPrice = services.reduce((sum, service) => sum + Number(service.price), 0);
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + totalDuration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;

    // Create appointment
    const appointment = await Appointment.create({
      customerId,
      businessId,
      staffId,
      appointmentDate,
      startTime,
      endTime,
      totalPrice,
      totalDuration,
      status: AppointmentStatus.CONFIRMED,
      notes,
    });

    // Create appointment-service relationships
    await Promise.all(
      serviceIds.map((serviceId: number) =>
        AppointmentService.create({
          appointmentId: appointment.id,
          serviceId,
        })
      )
    );

    // Fetch complete appointment with associations
    const completeAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Service,
          as: 'services',
          through: { attributes: [] },
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'businessName', 'address', 'city', 'state', 'phone', 'ownerId'],
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }]
        },
        {
          model: StaffMember,
          as: 'staff',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName', 'fullName'],
          }],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
    });

    // Send notifications
    try {
      const appointmentData = completeAppointment?.toJSON() as any;
      const serviceNames = appointmentData.services?.map((s: any) => s.name).join(', ') || 'services';
      const appointmentDateTime = `${appointment.appointmentDate} at ${appointment.startTime}`;

      // 1. Notify customer (confirmation)
      await notificationService.sendNotification({
        userId: customerId.toString(),
        type: 'appointment_booked',
        title: '🎉 Booking Confirmed!',
        message: `Your appointment at ${appointmentData.business.businessName} on ${appointmentDateTime} is confirmed! See you soon! 💙`,
        relatedId: appointment.id.toString(),
        relatedType: 'appointment',
        actionUrl: `/appointment/${appointment.id}`,
        emailData: {
          to: appointmentData.customer.email,
          subject: '🎉 Appointment Confirmed - We Can\'t Wait!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">🎉 You're All Set!</h2>
              <p style="color: #555; line-height: 1.6;">Hi ${appointmentData.customer.firstName}! 👋</p>
              <p style="color: #555; line-height: 1.6;">Great news! Your appointment has been confirmed and we're excited to see you! 🌟</p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>🏢 Business:</strong> ${appointmentData.business.businessName}</p>
                <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                <p style="margin: 5px 0;"><strong>👤 Staff:</strong> ${appointmentData.staff.user.fullName}</p>
                <p style="margin: 5px 0;"><strong>💰 Total:</strong> $${totalPrice}</p>
              </div>
              <p style="color: #555; line-height: 1.6;">We'll send you a reminder before your appointment. Can't wait to see you! 💙</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Need to make changes? You can reschedule or cancel anytime from your dashboard. 💬</p>
            </div>
          `
        }
      });

      // 2. Notify business owner
      await notificationService.sendNotification({
        userId: appointmentData.business.owner.id.toString(),
        type: 'appointment_booked',
        title: '📅 New Appointment!',
        message: `${appointmentData.customer.firstName} ${appointmentData.customer.lastName} just booked an appointment on ${appointmentDateTime}`,
        relatedId: appointment.id.toString(),
        relatedType: 'appointment',
        actionUrl: `/business/appointments`,
        emailData: {
          to: appointmentData.business.owner.email,
          subject: '📅 New Appointment Booked!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 New Appointment!</h2>
              <p style="color: #555; line-height: 1.6;">Hello! 👋</p>
              <p style="color: #555; line-height: 1.6;">Great news! You have a new appointment booking! 🎉</p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>👤 Customer:</strong> ${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</p>
                <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                <p style="margin: 5px 0;"><strong>👔 Staff:</strong> ${appointmentData.staff.user.fullName}</p>
                <p style="margin: 5px 0;"><strong>💰 Total:</strong> $${totalPrice}</p>
              </div>
              <p style="color: #555; line-height: 1.6;">Your calendar has been updated. Keep up the amazing work! 💙</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Your business is growing! 🌟</p>
            </div>
          `
        }
      });

      // 3. Notify staff member
      if (appointmentData.staff?.user) {
        await notificationService.sendNotification({
          userId: appointmentData.staff.user.id.toString(),
          type: 'appointment_assigned',
          title: '📅 New Appointment Assigned!',
          message: `You have a new appointment with ${appointmentData.customer.firstName} ${appointmentData.customer.lastName} on ${appointmentDateTime}`,
          relatedId: appointment.id.toString(),
          relatedType: 'appointment',
          actionUrl: `/staff-dashboard`,
          emailData: {
            to: appointmentData.staff.user.email,
            subject: '📅 New Appointment Assigned to You!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 New Appointment!</h2>
                <p style="color: #555; line-height: 1.6;">Hi there! 👋</p>
                <p style="color: #555; line-height: 1.6;">You have a new appointment coming up! Time to shine! ✨</p>
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 5px 0;"><strong>👤 Customer:</strong> ${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</p>
                  <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                  <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                  <p style="margin: 5px 0;"><strong>⏱️ Duration:</strong> ${totalDuration} minutes</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Your schedule has been updated. Looking forward to a great session! 💙</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">You've got this! 🌟</p>
              </div>
            `
          }
        });
      }
    } catch (notifError) {
      console.error('Error sending booking notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: completeAppointment,
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

// Get customer's appointments
export const getCustomerAppointments = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const appointments = await Appointment.findAll({
      where: { customerId },
      include: [
        {
          model: Service,
          as: 'services',
          through: { attributes: [] },
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'businessName', 'address', 'city', 'state', 'phone', 'email'],
        },
        {
          model: StaffMember,
          as: 'staff',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'fullName'],
          }],
          attributes: ['id', 'position'],
        },
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'DESC']],
    });

    res.json(appointments);
  } catch (error: any) {
    console.error('Get customer appointments error:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Get business appointments (Business owner only)
export const getBusinessAppointments = async (req: AuthRequest, res: Response): Promise<Response | void> => {
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

    const appointments = await Appointment.findAll({
      where: { businessId: business.id },
      include: [
        {
          model: Service,
          as: 'services',
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'fullName', 'email', 'phone'],
        },
        {
          model: StaffMember,
          as: 'staff',
          include: [{
            model: User,
            as: 'user',
            attributes: ['fullName'],
          }],
          attributes: ['id', 'position'],
        },
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'DESC']],
    });

    res.json(appointments);
  } catch (error: any) {
    console.error('Get business appointments error:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Get staff appointments (Staff member only)
export const getStaffAppointments = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find staff member record for this user
    const staffMember = await StaffMember.findOne({ where: { userId } });
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member record not found' });
    }

    const appointments = await Appointment.findAll({
      where: { staffId: staffMember.id },
      include: [
        {
          model: Service,
          as: 'services',
          through: { attributes: [] },
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'businessName', 'address', 'city', 'state', 'phone', 'email'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'fullName', 'email', 'phone'],
        },
      ],
      order: [['appointmentDate', 'ASC'], ['startTime', 'ASC']],
    });

    res.json(appointments);
  } catch (error: any) {
    console.error('Get staff appointments error:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Service,
          as: 'services',
          through: { attributes: [] },
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'businessName', 'address', 'city', 'state', 'phone', 'email'],
        },
        {
          model: StaffMember,
          as: 'staff',
          include: [{
            model: User,
            as: 'user',
            attributes: ['fullName'],
          }],
          attributes: ['id', 'position'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phone'],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization: customer or business owner
    const business = await Business.findOne({ where: { ownerId: userId } });
    const isCustomer = appointment.customerId === userId;
    const isBusinessOwner = business && business.id === appointment.businessId;

    if (!isCustomer && !isBusinessOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(appointment);
  } catch (error: any) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Error fetching appointment', error: error.message });
  }
};

// Update appointment status (Business owner only)
export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns the business
    const business = await Business.findOne({ where: { ownerId: userId } });
    if (!business || business.id !== appointment.businessId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await appointment.update({ status });

    res.json({
      message: 'Appointment status updated successfully',
      appointment,
    });
  } catch (error: any) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// Cancel appointment (Customer or Business owner)
export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'businessName', 'ownerId'],
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }]
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: StaffMember,
          as: 'staff',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }]
        },
        {
          model: Service,
          as: 'services',
          through: { attributes: [] }
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    const business = await Business.findOne({ where: { ownerId: userId } });
    const isCustomer = appointment.customerId === userId;
    const isBusinessOwner = business && business.id === appointment.businessId;

    if (!isCustomer && !isBusinessOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update status to cancelled instead of deleting
    await appointment.update({
      status: AppointmentStatus.CANCELLED
    });

    // Send notifications
    try {
      const appointmentData = appointment.toJSON() as any;
      const serviceNames = appointmentData.services?.map((s: any) => s.name).join(', ') || 'your services';
      const appointmentDateTime = `${appointment.appointmentDate} at ${appointment.startTime}`;

      if (isBusinessOwner) {
        // Business cancelled - notify business owner (confirmation)
        await notificationService.sendNotification({
          userId: appointmentData.business.owner.id.toString(),
          type: 'appointment_cancelled_by_business',
          title: '✓ Cancellation Confirmed',
          message: `Appointment with ${appointmentData.customer.firstName} ${appointmentData.customer.lastName} on ${appointmentDateTime} has been cancelled`,
          relatedId: appointment.id.toString(),
          relatedType: 'appointment',
          actionUrl: `/business/appointments`,
          emailData: {
            to: appointmentData.business.owner.email,
            subject: '✓ Appointment Cancelled - Confirmation',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">✓ Cancellation Confirmed</h2>
                <p style="color: #555; line-height: 1.6;">Hello! 👋</p>
                <p style="color: #555; line-height: 1.6;">Just confirming that the appointment has been cancelled as requested.</p>
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 5px 0;"><strong>👤 Customer:</strong> ${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</p>
                  <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                  <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                </div>
                <p style="color: #555; line-height: 1.6;">The appointment has been successfully cancelled and the customer has been notified. 💙</p>
                <p style="color: #555; line-height: 1.6;">This time slot is now available for new bookings. 🌟</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">Keep up the great work! 💬</p>
              </div>
            `
          }
        });

        // Notify customer
        await notificationService.sendNotification({
          userId: appointment.customerId.toString(),
          type: 'appointment_cancelled_by_business',
          title: '😔 Appointment Cancelled',
          message: `We're sorry! Your appointment at ${appointmentData.business.businessName} on ${appointmentDateTime} has been cancelled. We hope to see you soon! 💙`,
          relatedId: appointment.id.toString(),
          relatedType: 'appointment',
          actionUrl: `/appointments`,
          emailData: {
            to: appointmentData.customer.email,
            subject: "😔 Appointment Cancelled - We're Sorry!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">😔 We're Sorry!</h2>
                <p style="color: #555; line-height: 1.6;">Hi ${appointmentData.customer.firstName}! 👋</p>
                <p style="color: #555; line-height: 1.6;">We're really sorry, but <strong>${appointmentData.business.businessName}</strong> had to cancel your upcoming appointment.</p>
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                  <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                </div>
                <p style="color: #555; line-height: 1.6;">We know this can be frustrating, and we apologize for any inconvenience! 💙</p>
                <p style="color: #555; line-height: 1.6;">The good news? You can book a new appointment anytime that works for you! We'd love to have you back. 🌟</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">Have questions? Feel free to reach out to us anytime! 💬</p>
              </div>
            `
          }
        });

        // Also notify staff member
        if (appointmentData.staff?.user) {
          await notificationService.sendNotification({
            userId: appointmentData.staff.user.id.toString(),
            type: 'appointment_assigned_cancelled',
            title: '📅 Schedule Update',
            message: `Heads up! The appointment with ${appointmentData.customer.firstName} ${appointmentData.customer.lastName} on ${appointmentDateTime} has been cancelled`,
            relatedId: appointment.id.toString(),
            relatedType: 'appointment',
            actionUrl: `/staff-dashboard`,
            emailData: {
              to: appointmentData.staff.user.email,
              subject: '📅 Schedule Update - Appointment Cancelled',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                  <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 Schedule Update</h2>
                  <p style="color: #555; line-height: 1.6;">Hi there! 👋</p>
                  <p style="color: #555; line-height: 1.6;">Just a quick heads up - an appointment on your schedule has been cancelled.</p>
                  <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                    <p style="margin: 5px 0;"><strong>👤 Customer:</strong> ${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</p>
                    <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                    <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                  </div>
                  <p style="color: #555; line-height: 1.6;">Your schedule has been updated accordingly. 💙</p>
                </div>
              `
            }
          });
        }
      } else {
        // Customer cancelled - notify customer (confirmation)
        await notificationService.sendNotification({
          userId: appointment.customerId.toString(),
          type: 'appointment_cancelled_by_customer',
          title: '✓ Cancellation Confirmed',
          message: `Your appointment at ${appointmentData.business.businessName} on ${appointmentDateTime} has been cancelled`,
          relatedId: appointment.id.toString(),
          relatedType: 'appointment',
          actionUrl: `/appointments`,
          emailData: {
            to: appointmentData.customer.email,
            subject: '✓ Appointment Cancelled - Confirmation',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">✓ Cancellation Confirmed</h2>
                <p style="color: #555; line-height: 1.6;">Hi ${appointmentData.customer.firstName}! 👋</p>
                <p style="color: #555; line-height: 1.6;">Just confirming that we've cancelled your appointment as requested.</p>
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 5px 0;"><strong>🏢 Business:</strong> ${appointmentData.business.businessName}</p>
                  <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                  <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Your appointment has been successfully cancelled. 💙</p>
                <p style="color: #555; line-height: 1.6;">Need to book again? We're here whenever you're ready! 🌟</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">Thanks for letting us know! 💬</p>
              </div>
            `
          }
        });

        // Notify business owner
        await notificationService.sendNotification({
          userId: appointmentData.business.owner.id.toString(),
          type: 'appointment_cancelled_by_customer',
          title: '📅 Appointment Cancelled',
          message: `${appointmentData.customer.firstName} ${appointmentData.customer.lastName} has cancelled their appointment on ${appointmentDateTime}`,
          relatedId: appointment.id.toString(),
          relatedType: 'appointment',
          actionUrl: `/business/appointments`,
          emailData: {
            to: appointmentData.business.owner.email,
            subject: '📅 Appointment Update - Customer Cancellation',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 Appointment Update</h2>
                <p style="color: #555; line-height: 1.6;">Hello! 👋</p>
                <p style="color: #555; line-height: 1.6;">We wanted to let you know that <strong>${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</strong> has cancelled their upcoming appointment.</p>
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 5px 0;"><strong>👤 Customer:</strong> ${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</p>
                  <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                  <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                </div>
                <p style="color: #555; line-height: 1.6;">This time slot is now available for other bookings. 🌟</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">Keep up the great work! 💙</p>
              </div>
            `
          }
        });

        // Also notify staff member
        if (appointmentData.staff?.user) {
          await notificationService.sendNotification({
            userId: appointmentData.staff.user.id.toString(),
            type: 'appointment_assigned_cancelled',
            title: '📅 Schedule Update',
            message: `${appointmentData.customer.firstName} ${appointmentData.customer.lastName} cancelled their appointment on ${appointmentDateTime}`,
            relatedId: appointment.id.toString(),
            relatedType: 'appointment',
            actionUrl: `/staff-dashboard`,
            emailData: {
              to: appointmentData.staff.user.email,
              subject: '📅 Schedule Update - Appointment Cancelled',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                  <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 Schedule Update</h2>
                  <p style="color: #555; line-height: 1.6;">Hi there! 👋</p>
                  <p style="color: #555; line-height: 1.6;">Just wanted to give you a heads up - <strong>${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</strong> has cancelled their appointment.</p>
                  <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                    <p style="margin: 5px 0;"><strong>👤 Customer:</strong> ${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</p>
                    <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                    <p style="margin: 5px 0;"><strong>📅 Date & Time:</strong> ${appointmentDateTime}</p>
                  </div>
                  <p style="color: #555; line-height: 1.6;">Your schedule has been updated. You've got this! 💙</p>
                </div>
              `
            }
          });
        }
      }
    } catch (notifError) {
      console.error('Error sending cancellation notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: {
        id: appointment.id,
        status: AppointmentStatus.CANCELLED
      }
    });
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};

// Reschedule appointment (customer or business owner)
export const rescheduleAppointment = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { appointmentDate, startTime, endTime, staffId, serviceIds, totalDuration, totalPrice } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!appointmentDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'Appointment date, start time, and end time are required' });
    }

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    const business = await Business.findOne({ where: { ownerId: userId } });
    const isCustomer = appointment.customerId === userId;
    const isBusinessOwner = business && business.id === appointment.businessId;

    if (!isCustomer && !isBusinessOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const newStaffId = staffId || appointment.staffId;

    // Check if new time slot is available
    const conflictingAppointment = await Appointment.findOne({
      where: {
        staffId: newStaffId,
        appointmentDate,
        status: {
          [Op.ne]: AppointmentStatus.CANCELLED
        },
        id: {
          [Op.ne]: id
        }
      }
    });

    if (conflictingAppointment) {
      // Check for time overlap
      const newStart = startTime;
      const newEnd = endTime;
      const existingStart = conflictingAppointment.startTime;
      const existingEnd = conflictingAppointment.endTime;

      if (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        return res.status(409).json({ message: 'This time slot is not available' });
      }
    }

    // Update appointment
    const updateData: any = {
      appointmentDate,
      startTime,
      endTime
    };

    if (staffId) updateData.staffId = staffId;
    if (totalDuration) updateData.totalDuration = totalDuration;
    if (totalPrice) updateData.totalPrice = totalPrice;

    // Save old date/time BEFORE updating
    const oldDateTime = `${appointment.appointmentDate} at ${appointment.startTime}`;

    await appointment.update(updateData);

    // Update services if provided
    if (serviceIds && serviceIds.length > 0) {
      // Remove old service associations
      await AppointmentService.destroy({ where: { appointmentId: id } });
      
      // Add new service associations
      for (const serviceId of serviceIds) {
        await AppointmentService.create({
          appointmentId: Number(id),
          serviceId
        });
      }
    }

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Service,
          as: 'services',
          through: { attributes: [] },
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'businessName', 'address', 'city', 'state', 'phone', 'email', 'ownerId'],
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }]
        },
        {
          model: StaffMember,
          as: 'staff',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName', 'fullName'],
          }],
          attributes: ['id', 'position'],
        },
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
    });

    // Send reschedule notifications
    try {
      const appointmentData = updatedAppointment?.toJSON() as any;
      const serviceNames = appointmentData.services?.map((s: any) => s.name).join(', ') || 'services';
      const newDateTime = `${appointmentDate} at ${startTime}`;

      // 1. Notify customer
      await notificationService.sendNotification({
        userId: appointmentData.customer.id.toString(),
        type: 'appointment_booked',
        title: '📅 Appointment Rescheduled!',
        message: `Your appointment at ${appointmentData.business.businessName} has been rescheduled to ${newDateTime} 💙`,
        relatedId: appointment.id.toString(),
        relatedType: 'appointment',
        actionUrl: `/appointment/${appointment.id}`,
        emailData: {
          to: appointmentData.customer.email,
          subject: '📅 Appointment Rescheduled - Updated Details',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 Schedule Update!</h2>
              <p style="color: #555; line-height: 1.6;">Hi ${appointmentData.customer.firstName}! 👋</p>
              <p style="color: #555; line-height: 1.6;">Good news! Your appointment has been rescheduled. Here are your new details! ✨</p>
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 5px 0; color: #856404;"><strong>⏰ Previous Time:</strong> ${oldDateTime}</p>
              </div>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>🏢 Business:</strong> ${appointmentData.business.businessName}</p>
                <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                <p style="margin: 5px 0;"><strong>📅 New Date & Time:</strong> ${newDateTime}</p>
                <p style="margin: 5px 0;"><strong>👤 Staff:</strong> ${appointmentData.staff?.user?.fullName || 'N/A'}</p>
              </div>
              <p style="color: #555; line-height: 1.6;">We're looking forward to seeing you at the new time! 💙</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Need to make more changes? Just let us know! 💬</p>
            </div>
          `
        }
      });

      // 2. Notify business owner
      await notificationService.sendNotification({
        userId: appointmentData.business.owner.id.toString(),
        type: 'appointment_booked',
        title: '📅 Appointment Rescheduled',
        message: `${appointmentData.customer.firstName} ${appointmentData.customer.lastName}'s appointment has been rescheduled to ${newDateTime}`,
        relatedId: appointment.id.toString(),
        relatedType: 'appointment',
        actionUrl: `/business/appointments`,
        emailData: {
          to: appointmentData.business.owner.email,
          subject: '📅 Appointment Rescheduled - Updated Schedule',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 Schedule Update</h2>
              <p style="color: #555; line-height: 1.6;">Hello! 👋</p>
              <p style="color: #555; line-height: 1.6;">An appointment has been rescheduled. Here are the updated details:</p>
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 5px 0; color: #856404;"><strong>⏰ Previous Time:</strong> ${oldDateTime}</p>
              </div>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>👤 Customer:</strong> ${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</p>
                <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                <p style="margin: 5px 0;"><strong>📅 New Date & Time:</strong> ${newDateTime}</p>
                <p style="margin: 5px 0;"><strong>👔 Staff:</strong> ${appointmentData.staff?.user?.fullName || 'N/A'}</p>
              </div>
              <p style="color: #555; line-height: 1.6;">Your calendar has been updated accordingly. 💙</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Keep up the great work! 🌟</p>
            </div>
          `
        }
      });

      // 3. Notify staff member
      if (appointmentData.staff?.user) {
        await notificationService.sendNotification({
          userId: appointmentData.staff.user.id.toString(),
          type: 'appointment_assigned',
          title: '📅 Appointment Rescheduled',
          message: `Your appointment with ${appointmentData.customer.firstName} ${appointmentData.customer.lastName} has been rescheduled to ${newDateTime}`,
          relatedId: appointment.id.toString(),
          relatedType: 'appointment',
          actionUrl: `/staff-dashboard`,
          emailData: {
            to: appointmentData.staff.user.email,
            subject: '📅 Appointment Rescheduled - Schedule Update',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">📅 Schedule Update</h2>
                <p style="color: #555; line-height: 1.6;">Hi there! 👋</p>
                <p style="color: #555; line-height: 1.6;">One of your appointments has been rescheduled to a new time! ✨</p>
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p style="margin: 5px 0; color: #856404;"><strong>⏰ Previous Time:</strong> ${oldDateTime}</p>
                </div>
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 5px 0;"><strong>👤 Customer:</strong> ${appointmentData.customer.firstName} ${appointmentData.customer.lastName}</p>
                  <p style="margin: 5px 0;"><strong>✨ Service:</strong> ${serviceNames}</p>
                  <p style="margin: 5px 0;"><strong>📅 New Date & Time:</strong> ${newDateTime}</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Your schedule has been updated. Looking forward to a great session! 💙</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">You've got this! 🌟</p>
              </div>
            `
          }
        });
      }
    } catch (notifError) {
      console.error('Error sending reschedule notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ message: 'Error rescheduling appointment', error: error.message });
  }
};
