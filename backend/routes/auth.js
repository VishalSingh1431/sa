import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { verifyToken, verifyMainAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

const router = express.Router();

// Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter configuration
let transporter = null;

const initializeEmailTransporter = () => {
  if (transporter) return transporter;
  
  // Try Gmail first if credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return transporter;
  }
  
  // Fallback: Use SMTP configuration if provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }
  
  return null;
};

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP via email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in database
    await Otp.create(email, otp, expiresAt);

    // Initialize email transporter
    const emailTransporter = initializeEmailTransporter();

    // Professional email template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VaranasiHub - OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">VaranasiHub</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                            <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                                Thank you for using VaranasiHub! Please use the following One-Time Password (OTP) to complete your verification:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                                <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 15px 0; display: inline-block;">
                                    <h1 style="margin: 0; color: #2563eb; font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otp}</h1>
                                </div>
                                <p style="margin: 15px 0 0; color: #e0e7ff; font-size: 13px;">This code will expire in 10 minutes</p>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you didn't request this code, please ignore this email or contact our support team if you have concerns.
                            </p>
                            
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                                    For security reasons, never share this code with anyone. VaranasiHub will never ask for your OTP.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                <strong style="color: #111827;">VaranasiHub</strong> - Your Gateway to Varanasi
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} VaranasiHub. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"VaranasiHub" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@varanasihub.com'}>`,
      to: email,
      subject: 'VaranasiHub - Your Verification Code',
      html: emailHtml,
      text: `Your VaranasiHub verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    };

    // Try to send email
    if (emailTransporter) {
      try {
        await emailTransporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to ${email}`);
        return res.json({ message: 'OTP sent successfully to your email' });
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError);
        // Fallback: log OTP if email fails
        console.log(`⚠️ Email sending failed. OTP for ${email}: ${otp}`);
        return res.json({ 
          message: 'OTP sent successfully (check console - email service unavailable)',
          otp: otp,
          warning: 'Email service is not properly configured. Please check your email settings.'
        });
      }
    } else {
      // No email transporter configured
      console.log(`⚠️ Email not configured. OTP for ${email}: ${otp}`);
      return res.json({ 
        message: 'OTP generated (email not configured - check console)',
        otp: otp,
        warning: 'Please configure email settings in .env file to receive OTP via email'
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, isSignup } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find valid OTP in database
    const storedOtp = await Otp.findValidOtp(email, otp);

    if (!storedOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await Otp.markAsUsed(storedOtp.id);

    // Find or create user by email (email is common identifier)
    let user = await User.findByEmail(email);

    if (isSignup) {
      // If user already exists (via Google or email), allow them to login
      if (user) {
        // User exists - treat as login instead of signup
        console.log(`User ${email} already exists, logging in via OTP`);
      } else {
        // Create new user with default 'user' role
        user = await User.create({
          email,
          name: null,
          phone: null,
          bio: null,
          picture: null,
          googleId: null,
        });
        // Set role to 'user' explicitly (database default should handle this, but ensure it)
        user = await User.update(user.id, { role: 'user' });
        console.log(`New user created via OTP: ${email}`);
        // Send welcome email
        await sendWelcomeEmail(email, null);
      }
    } else {
      // Login: user must exist
      if (!user) {
        return res.status(400).json({ error: 'User not found. Please sign up instead.' });
      }
    }

    // Generate JWT token (include role for authorization)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      message: isSignup ? 'Signup successful' : 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        picture: user.picture,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Google Authentication
router.post('/google', async (req, res) => {
  try {
    // Check if Google Client ID is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ 
        error: 'Google Sign-In is not configured. Please configure GOOGLE_CLIENT_ID in backend .env file or use email signup.' 
      });
    }

    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    let email, name, picture, sub;

    // Try to verify as ID token first
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      sub = payload.sub;
    } catch (idTokenError) {
      // If ID token verification fails, try to decode as base64 user info
      try {
        const decoded = JSON.parse(Buffer.from(tokenId, 'base64').toString());
        email = decoded.email;
        name = decoded.name;
        picture = decoded.picture;
        sub = decoded.sub;
      } catch (decodeError) {
        console.error('Failed to verify Google token:', idTokenError);
        console.error('Failed to decode user info:', decodeError);
        return res.status(400).json({ error: 'Invalid Google token format' });
      }
    }

    // Find or create user by email (email is common identifier)
    let user = await User.findByEmail(email);

    if (!user) {
      // New user - create account with default 'user' role
      user = await User.create({
        email,
        name,
        picture,
        googleId: sub,
        phone: null,
        bio: null,
      });
      // Set role to 'user' explicitly (database default should handle this, but ensure it)
      user = await User.update(user.id, { role: 'user' });
      console.log(`New user created via Google: ${email}`);
      // Send welcome email
      await sendWelcomeEmail(email, name);
    } else {
      // Existing user - update info and login (email is common, so allow login)
      user = await User.update(user.id, {
        name: name || user.name,
        picture: picture || user.picture,
        googleId: sub,
      });
      console.log(`Existing user logged in via Google: ${email}`);
    }

    // Generate JWT token (include role for authorization)
    const authToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentication successful',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        picture: user.picture,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error with Google authentication:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    
    // Check if it's a database connection error
    if (
      error.code === 'ENOTFOUND' || 
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'EAI_AGAIN' ||
      error.message.includes('getaddrinfo') ||
      error.message.includes('connection') ||
      error.message.includes('timeout') ||
      error.message.includes('connect ECONNREFUSED') ||
      error.message.includes('Database connection failed')
    ) {
      let errorMessage = 'Database connection failed.';
      let helpMessage = 'Please check your database configuration in the .env file.';
      
      if (error.code === 'ENOTFOUND') {
        errorMessage = 'Database hostname not found.';
        helpMessage = 'Get the correct connection string from https://console.aiven.io/ → Your Project → PostgreSQL → Connection Information';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Database connection refused.';
        helpMessage = 'Check if your Aiven database service is running (not paused).';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Database connection timeout.';
        helpMessage = 'Check your network connection and firewall settings.';
      }
      
      return res.status(503).json({ 
        error: errorMessage,
        help: helpMessage,
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      error: 'Google authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      userId: req.user.userId,
      email: req.user.email,
    },
  });
});

// Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        phone: user.phone,
        bio: user.bio,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    
    console.log('Profile update request:', { userId: req.user.userId, name, phone, bio });
    
    // Prepare update data - only include defined fields, convert empty strings to null
    const updateData = {};
    if (name !== undefined) updateData.name = name || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (bio !== undefined) updateData.bio = bio || null;
    
    console.log('Update data:', updateData);
    
    // Update user in database
    const user = await User.update(req.user.userId, updateData);
    
    if (!user) {
      console.error('User not found after update:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Profile updated successfully for user:', user.id);
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        phone: user.phone,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Check if it's a database connection error
    if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo')) {
      return res.status(503).json({ 
        error: 'Database connection failed. Please check your database configuration.',
        details: 'Cannot connect to database server'
      });
    }
    
    // Check for database column errors
    if (error.code === '42703') {
      return res.status(500).json({ 
        error: 'Database schema error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'A required database column is missing. Please contact support.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    });
  }
});

// Get all users (Main Admin only)
router.get('/users', verifyToken, verifyMainAdmin, async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    
    let users;
    if (search) {
      users = await User.search(search, parseInt(limit));
    } else {
      users = await User.findAll(parseInt(limit), parseInt(offset));
    }

    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Promote user to admin (Main Admin only)
router.put('/users/:userId/promote', verifyToken, verifyMainAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the user to promote
    const userToPromote = await User.findById(userId);
    
    if (!userToPromote) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow promoting 'user' to 'admin', not main_admin
    if (userToPromote.role === 'main_admin') {
      return res.status(400).json({ error: 'Cannot change main admin role' });
    }

    // Promote user to admin
    const updatedUser = await User.update(userId, { role: 'admin' });

    res.json({
      message: 'User promoted to admin successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

// Demote admin to user (Main Admin only)
router.put('/users/:userId/demote', verifyToken, verifyMainAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the user to demote
    const userToDemote = await User.findById(userId);
    
    if (!userToDemote) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cannot demote main admin
    if (userToDemote.role === 'main_admin') {
      return res.status(400).json({ error: 'Cannot demote main admin' });
    }

    // Demote admin to user
    const updatedUser = await User.update(userId, { role: 'user' });

    res.json({
      message: 'User demoted to user successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Error demoting user:', error);
    res.status(500).json({ error: 'Failed to demote user' });
  }
});

export default router;

