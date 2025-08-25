const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('../services/emailService');

// Show login form
router.get('/login', (req, res) => {
    // If user is already logged in, redirect to dashboard
    if (req.session.userId) {
        return res.redirect('/');
    }
    
    res.render('auth/login', { 
        title: 'Login',
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Handle login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validation
        if (!username || !password) {
            req.flash('error', 'Please provide both username and password');
            return res.redirect('/auth/login');
        }
        
        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: username.toLowerCase() }
            ],
            isActive: true
        });
        
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/auth/login');
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/auth/login');
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Create session
        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
        };
        
        req.flash('success', `Welcome back, ${user.firstName}!`);
        res.redirect('/');
        
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/auth/login');
    }
});

// Show register form
router.get('/register', (req, res) => {
    // If user is already logged in, redirect to dashboard
    if (req.session.userId) {
        return res.redirect('/');
    }
    
    res.render('auth/register', { 
        title: 'Register',
        error: req.flash('error'),
        user: {}
    });
});

// Handle registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword, firstName, lastName, role } = req.body;
        
        // Validation
        if (!username || !email || !password || !firstName || !lastName) {
            req.flash('error', 'All fields are required');
            return res.render('auth/register', {
                title: 'Register',
                error: req.flash('error'),
                user: req.body
            });
        }
        
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.render('auth/register', {
                title: 'Register',
                error: req.flash('error'),
                user: req.body
            });
        }
        
        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters long');
            return res.render('auth/register', {
                title: 'Register',
                error: req.flash('error'),
                user: req.body
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: email.toLowerCase() }
            ]
        });
        
        if (existingUser) {
            req.flash('error', 'Username or email already exists');
            return res.render('auth/register', {
                title: 'Register',
                error: req.flash('error'),
                user: req.body
            });
        }
        
        // Create new user
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role: role || 'staff'
        });
        
        await newUser.save();
        
        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/auth/login');
        
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.render('auth/register', {
            title: 'Register',
            error: req.flash('error'),
            user: req.body
        });
    }
});

// Handle logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.redirect('/auth/login');
    });
});

// Show profile page
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('auth/profile', {
            title: 'Profile',
            user,
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error('Profile error:', error);
        req.flash('error', 'Error loading profile');
        res.redirect('/');
    }
});

// Update profile
router.post('/profile', requireAuth, async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        
        await User.findByIdAndUpdate(req.session.userId, {
            firstName,
            lastName,
            email: email.toLowerCase()
        });
        
        // Update session data
        req.session.user.fullName = `${firstName} ${lastName}`;
        req.session.user.email = email.toLowerCase();
        
        req.flash('success', 'Profile updated successfully');
        res.redirect('/auth/profile');
        
    } catch (error) {
        console.error('Profile update error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/auth/profile');
    }
});

// Change password
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        
        // Validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            req.flash('error', 'All password fields are required');
            return res.redirect('/auth/profile');
        }
        
        if (newPassword !== confirmNewPassword) {
            req.flash('error', 'New passwords do not match');
            return res.redirect('/auth/profile');
        }
        
        if (newPassword.length < 6) {
            req.flash('error', 'New password must be at least 6 characters long');
            return res.redirect('/auth/profile');
        }
        
        // Get user and verify current password
        const user = await User.findById(req.session.userId);
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            req.flash('error', 'Current password is incorrect');
            return res.redirect('/auth/profile');
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        // Send confirmation email
        await sendPasswordChangedEmail(user);
        
        req.flash('success', 'Password changed successfully');
        res.redirect('/auth/profile');
        
    } catch (error) {
        console.error('Password change error:', error);
        req.flash('error', 'Error changing password');
        res.redirect('/auth/profile');
    }
});

// Show forgot password form
router.get('/forgot-password', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    
    res.render('auth/forgot-password', {
        title: 'Forgot Password',
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// Handle forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            req.flash('error', 'Please provide your email address');
            return res.redirect('/auth/forgot-password');
        }
        
        // Find user by email
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            isActive: true 
        });
        
        if (!user) {
            // Don't reveal if email exists or not for security
            req.flash('success', 'If an account with that email exists, we\'ve sent you a password reset link.');
            return res.redirect('/auth/forgot-password');
        }
        
        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save();
        
        // Send email
        const emailResult = await sendPasswordResetEmail(user, resetToken);
        
        if (emailResult.success) {
            req.flash('success', 'Password reset link sent to your email address. Please check your inbox.');
            
            // In development mode, also show the reset URL
            if (process.env.NODE_ENV !== 'production' && emailResult.resetURL) {
                req.flash('success', `Development Mode - Reset URL: ${emailResult.resetURL}`);
            }
        } else {
            req.flash('error', 'Failed to send password reset email. Please try again.');
        }
        
        res.redirect('/auth/forgot-password');
        
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/auth/forgot-password');
    }
});

// Show reset password form
router.get('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Hash the token to compare with database
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
            isActive: true
        });
        
        if (!user) {
            req.flash('error', 'Invalid or expired password reset token.');
            return res.redirect('/auth/forgot-password');
        }
        
        res.render('auth/reset-password', {
            title: 'Reset Password',
            token,
            error: req.flash('error'),
            success: req.flash('success')
        });
        
    } catch (error) {
        console.error('Reset password page error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/auth/forgot-password');
    }
});

// Handle password reset
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        
        // Validation
        if (!password || !confirmPassword) {
            req.flash('error', 'Please provide both password fields');
            return res.redirect(`/auth/reset-password/${token}`);
        }
        
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect(`/auth/reset-password/${token}`);
        }
        
        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters long');
            return res.redirect(`/auth/reset-password/${token}`);
        }
        
        // Hash the token to compare with database
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
            isActive: true
        });
        
        if (!user) {
            req.flash('error', 'Invalid or expired password reset token.');
            return res.redirect('/auth/forgot-password');
        }
        
        // Update password and clear reset token
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        // Send confirmation email
        await sendPasswordChangedEmail(user);
        
        req.flash('success', 'Password reset successfully! You can now login with your new password.');
        res.redirect('/auth/login');
        
    } catch (error) {
        console.error('Reset password error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect(`/auth/reset-password/${req.params.token}`);
    }
});

// Middleware to require authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        req.flash('error', 'Please login to access this page');
        return res.redirect('/auth/login');
    }
    next();
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.user.role !== 'admin') {
        req.flash('error', 'Access denied. Admin privileges required.');
        return res.redirect('/');
    }
    next();
}

module.exports = router;
module.exports.requireAuth = requireAuth;
module.exports.requireAdmin = requireAdmin;