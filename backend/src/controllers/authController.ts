import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, Business, StaffMember } from '../models';
import { UserRole, AuthProvider } from '../models/User';
import { ApprovalStatus } from '../models/Business';
import { AuthRequest } from '../middleware/auth';
import firebaseAdmin from '../config/firebase';
import EmailService from '../services/emailService';

// Password validation function
const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers' };
  }
  
  return { valid: true };
};

// In-memory storage for password reset codes
interface PasswordResetCode {
  code: string;
  email: string;
  expires: Date;
}

const passwordResetCodes = new Map<string, PasswordResetCode>();

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [key, value] of passwordResetCodes.entries()) {
    if (value.expires < now) {
      passwordResetCodes.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Generate JWT token
const generateToken = (userId: number, email: string, role: string, firstName?: string, lastName?: string, fullName?: string): string => {
  return jwt.sign(
    { userId, email, role, firstName, lastName, fullName },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register Customer (Local Auth)
export const registerCustomer = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    console.log('🔍 Backend - Received email:', email);
    console.log('🔍 Backend - Email type:', typeof email);
    console.log('🔍 Backend - Email length:', email?.length);

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate verification token
    const verificationToken = EmailService.generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new customer
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: UserRole.CUSTOMER,
      authProvider: AuthProvider.LOCAL,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
      isActive: true,
    });

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user is created
    }

    res.status(201).json({
      message: 'Customer registered successfully. Please check your email to verify your account.',
      user: user.toSafeObject(),
      emailSent: true,
    });
  } catch (error: any) {
    console.error('Register customer error:', error);
    res.status(500).json({ message: 'Error registering customer', error: error.message });
  }
};

// Register Staff (Local Auth)
export const registerStaff = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    console.log('📥 Register staff request body:', req.body);
    const { email, password, firstName, lastName, businessId } = req.body;

    if (!email || !password || !firstName || !lastName || !businessId) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, firstName: !!firstName, lastName: !!lastName, businessId: !!businessId });
      return res.status(400).json({ message: 'All fields are required: email, password, firstName, lastName, businessId' });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Find business by businessId
    const business = await Business.findOne({ where: { businessId } });
    if (!business) {
      return res.status(404).json({ message: 'Business not found. Please check your Business ID' });
    }

    // Generate verification token
    const verificationToken = EmailService.generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create fullName from firstName and lastName
    const fullName = `${firstName} ${lastName}`;

    // Create new staff user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      fullName,
      role: UserRole.STAFF,
      authProvider: AuthProvider.LOCAL,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
      isActive: true,
    });

    // Create staff member association
    await StaffMember.create({
      userId: user.id,
      businessId: business.id,
      isActive: true,
    });

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Send welcome notification to staff
    try {
      const { notificationService } = await import('../services/notificationService');
      await notificationService.sendNotification({
        userId: user.id.toString(),
        type: 'staff_added',
        title: '🎉 Welcome to the Team!',
        message: `You've been added to ${business.businessName}! We're excited to have you on board! 💙`,
        relatedId: business.id.toString(),
        relatedType: 'appointment',
        actionUrl: `/staff-dashboard`,
        emailData: {
          to: user.email,
          subject: '🎉 Welcome to the Team!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">🎉 Welcome Aboard!</h2>
              <p style="color: #555; line-height: 1.6;">Hi ${fullName}! 👋</p>
              <p style="color: #555; line-height: 1.6;">Exciting news! You've been added as a staff member at <strong>${business.businessName}</strong>! 🌟</p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>🏢 Business:</strong> ${business.businessName}</p>
                <p style="margin: 5px 0;"><strong>📧 Your Email:</strong> ${user.email}</p>
                <p style="margin: 5px 0;"><strong>🔑 Your Role:</strong> Staff Member</p>
              </div>
              <p style="color: #555; line-height: 1.6;">Please verify your email to get started. Once verified, you'll be able to:</p>
              <ul style="color: #555; line-height: 1.6;">
                <li>View your schedule and appointments</li>
                <li>Manage your availability</li>
                <li>Connect with customers</li>
              </ul>
              <p style="color: #555; line-height: 1.6;">We're thrilled to have you on the team! Let's do amazing work together! 💙</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Welcome to the family! 🎉</p>
            </div>
          `
        }
      });

      // Send notification to business owner about new staff
      const businessOwner = await User.findByPk(business.ownerId);
      if (businessOwner) {
        await notificationService.sendNotification({
          userId: business.ownerId.toString(),
          type: 'staff_added',
          title: '👥 New Team Member!',
          message: `${fullName} has joined your team at ${business.businessName}! 🎉`,
          relatedId: business.id.toString(),
          relatedType: 'appointment',
          actionUrl: `/business/staff`,
          emailData: {
            to: businessOwner.email,
            subject: '👥 New Team Member Joined!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">👥 Team Update!</h2>
                <p style="color: #555; line-height: 1.6;">Hello! 👋</p>
                <p style="color: #555; line-height: 1.6;">Great news! A new staff member has joined your team! 🎉</p>
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <p style="margin: 5px 0;"><strong>👤 New Staff:</strong> ${fullName}</p>
                  <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${user.email}</p>
                  <p style="margin: 5px 0;"><strong>🏢 Business:</strong> ${business.businessName}</p>
                </div>
                <p style="color: #555; line-height: 1.6;">They'll need to verify their email before accessing the platform. Once verified, they'll be ready to:</p>
                <ul style="color: #555; line-height: 1.6;">
                  <li>View their schedule and appointments</li>
                  <li>Manage their availability</li>
                  <li>Serve your customers</li>
                </ul>
                <p style="color: #555; line-height: 1.6;">Your team is growing! Keep up the great work! 💙</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">Your business is thriving! 🌟</p>
              </div>
            `
          }
        });
      }
    } catch (notifError) {
      console.error('Failed to send welcome notification:', notifError);
    }

    res.status(201).json({
      message: 'Staff registered successfully. Please check your email to verify your account.',
      user: user.toSafeObject(),
      businessName: business.businessName,
      emailSent: true,
    });
  } catch (error: any) {
    console.error('Register staff error:', error);
    res.status(500).json({ message: 'Error registering staff', error: error.message });
  }
};

// Register Business Owner (Multi-step)
export const registerBusiness = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    console.log('Register business request body:', req.body);
    
    const { 
      email, 
      password, 
      firstName,
      lastName, 
      businessName, 
      businessType,
      address,
      city,
      state,
      zipCode,
      phone,
      website 
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !businessName) {
      console.error('Missing required fields:', { email: !!email, password: !!password, firstName: !!firstName, lastName: !!lastName, businessName: !!businessName });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // Check if user has a rejected business - allow reapplication
      const existingBusiness = await Business.findOne({ 
        where: { ownerId: existingUser.id } 
      });
      
      if (existingBusiness && existingBusiness.approvalStatus === 'rejected') {
        console.log('🔄 Reapplication from rejected business owner:', email);
        
        // Create fullName first
        const fullName = `${firstName} ${lastName}`;
        
        // Update existing business with new information
        await existingBusiness.update({
          businessName,
          businessType,
          address,
          city,
          state,
          zipCode,
          phone,
          website,
          approvalStatus: ApprovalStatus.PENDING,
          isActive: true,
          rejectionReason: undefined,
        });
        
        // Reactivate user account with new info
        const verificationToken = EmailService.generateVerificationToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await existingUser.update({
          firstName,
          lastName,
          fullName,
          password, // Update password
          isActive: true,
          emailVerified: false,
          verificationToken,
          verificationTokenExpires,
        });
        
        // Send verification email
        try {
          await EmailService.sendVerificationEmail(existingUser.email, verificationToken);
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { id: existingUser.id, email: existingUser.email, role: existingUser.role },
          process.env.JWT_SECRET!,
          { expiresIn: '30d' }
        );
        
        return res.json({
          token,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            fullName: existingUser.fullName,
            role: existingUser.role,
          },
          business: existingBusiness,
          approvalStatus: existingBusiness.approvalStatus,
          message: 'Reapplication submitted successfully. Please verify your email.'
        });
      }
      
      return res.status(400).json({ message: 'Email already registered' });
    }

    console.log('Creating business owner user...');
    // Create fullName from firstName and lastName
    const fullName = `${firstName} ${lastName}`;
    
    // Create new business owner user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      fullName,
      role: UserRole.BUSINESS_OWNER,
      authProvider: AuthProvider.LOCAL,
      emailVerified: false,
      isActive: true,
    });

    console.log('User created:', user.id);
    console.log('Creating business...');

    // Generate verification token
    const verificationToken = EmailService.generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with verification token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Create business
    const business = await Business.create({
      ownerId: user.id,
      businessName,
      businessType,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      website,
      isActive: true,
    });

    console.log('Business created:', business.id, business.businessId);

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      message: 'Business registered successfully. Please check your email to verify your account.',
      user: user.toSafeObject(),
      business: {
        id: business.id,
        businessName: business.businessName,
        businessId: business.businessId,
        approvalStatus: business.approvalStatus,
      },
      approvalStatus: business.approvalStatus,
      emailSent: true,
    });
  } catch (error: any) {
    console.error('Register business error:', error);
    res.status(500).json({ message: 'Error registering business', error: error.message });
  }
};

// Login (Local Auth)
export const login = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Email not verified. Please check your email for the verification link.',
        emailVerified: false,
        email: user.email
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user.id, user.email, user.role, user.firstName, user.lastName, user.fullName);

    // Get additional data based on role
    let additionalData: any = {};
    if (user.role === UserRole.BUSINESS_OWNER) {
      const business = await Business.findOne({ where: { ownerId: user.id } });
      additionalData.business = business;
      additionalData.approvalStatus = business?.approvalStatus;
    } else if (user.role === UserRole.STAFF) {
      const staffMembership = await StaffMember.findOne({ 
        where: { userId: user.id },
        include: [{ model: Business, as: 'business' }]
      });
      additionalData.staffMembership = staffMembership;
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
      ...additionalData,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

// Firebase Authentication
export const firebaseAuth = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { firebaseToken, role, additionalData } = req.body;

    if (!firebaseAdmin) {
      return res.status(500).json({ message: 'Firebase is not configured' });
    }

    // Verify Firebase token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'Email is required from Firebase token' });
    }

    // Check if user exists
    let user = await User.findOne({ where: { firebaseUid: uid } });

    if (!user) {
      // Check if email exists with different auth provider
      user = await User.findOne({ where: { email } });
      
      if (user && user.authProvider !== AuthProvider.FIREBASE) {
        return res.status(400).json({ 
          message: 'Email already registered with different authentication method' 
        });
      }

      // Create new user
      user = await User.create({
        email,
        fullName: name || additionalData?.fullName,
        firstName: additionalData?.firstName,
        lastName: additionalData?.lastName,
        phone: additionalData?.phone,
        role: role as UserRole,
        authProvider: AuthProvider.FIREBASE,
        firebaseUid: uid,
        emailVerified: decodedToken.email_verified || false,
        isActive: true,
      });

      // Handle business or staff registration
      if (role === UserRole.BUSINESS_OWNER && additionalData?.businessName) {
        await Business.create({
          ownerId: user.id,
          businessName: additionalData.businessName,
          businessType: additionalData.businessType,
          isActive: true,
        });
      } else if (role === UserRole.STAFF && additionalData?.businessId) {
        const business = await Business.findOne({ where: { businessId: additionalData.businessId } });
        if (business) {
          await StaffMember.create({
            userId: user.id,
            businessId: business.id,
            isActive: true,
          });
        }
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role, user.firstName, user.lastName, user.fullName);

    res.status(200).json({
      message: 'Firebase authentication successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (error: any) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ message: 'Error during Firebase authentication', error: error.message });
  }
};

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let additionalData: any = {};
    if (user.role === UserRole.BUSINESS_OWNER) {
      const business = await Business.findOne({ where: { ownerId: user.id } });
      additionalData.business = business;
    } else if (user.role === UserRole.STAFF) {
      const staffMembership = await StaffMember.findOne({ 
        where: { userId: user.id },
        include: [{ model: Business, as: 'business' }]
      });
      additionalData.staffMembership = staffMembership;
    }

    res.status(200).json({
      user: user.toSafeObject(),
      ...additionalData,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Logout (optional - mainly for token blacklisting if implemented)
export const logout = async (_req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    // In a stateless JWT setup, logout is handled client-side by removing the token
    // If you implement token blacklisting, add logic here
    
    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout', error: error.message });
  }
};

// Verify Email
export const verifyEmail = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const user = await User.findOne({ 
      where: { 
        verificationToken: token,
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Check if token is expired
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return res.status(400).json({ message: 'Verification token has expired. Please request a new one.' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(user.email, user.fullName || user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(200).json({
      message: 'Email verified successfully! You can now log in.',
      emailVerified: true,
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

// Resend Verification Email
export const resendVerification = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = EmailService.generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    await EmailService.sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      message: 'Verification email sent successfully. Please check your inbox.',
      emailSent: true,
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Error sending verification email', error: error.message });
  }
};

// Forgot Password - Send reset code
export const forgotPassword = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({ 
        message: 'If that email exists, a reset code has been sent.' 
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in memory
    passwordResetCodes.set(email, { code, email, expires });

    // Send email with code
    await EmailService.sendPasswordResetEmail(email, code);

    res.status(200).json({
      message: 'Reset code sent to your email',
      codeSent: true,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending reset code', error: error.message });
  }
};

// Verify Reset Code
export const verifyResetCode = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { email, code } = req.body;

    // Get stored code
    const storedData = passwordResetCodes.get(email);

    if (!storedData) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Check if expired
    if (storedData.expires < new Date()) {
      passwordResetCodes.delete(email);
      return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
    }

    // Verify code
    if (storedData.code !== code) {
      return res.status(400).json({ message: 'Invalid code. Please try again.' });
    }

    // Generate temporary token for password reset
    const tempToken = jwt.sign(
      { email, purpose: 'password_reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );

    res.status(200).json({
      message: 'Code verified successfully',
      tempToken,
    });
  } catch (error: any) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Error verifying code', error: error.message });
  }
};

// Reset Password
export const resetPassword = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { token, newPassword } = req.body;

    // Verify temp token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Find user
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (will be hashed by User model hook)
    user.password = newPassword;
    await user.save();

    // Remove code from memory
    passwordResetCodes.delete(decoded.email);

    res.status(200).json({
      message: 'Password reset successfully',
      success: true,
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};
