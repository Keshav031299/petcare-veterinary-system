const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
    // For development, we'll use a simple configuration
    // In production, you would use a real email service like Gmail, SendGrid, etc.
    
    if (process.env.NODE_ENV === 'production') {
        // Production email configuration (Gmail example)
        return nodemailer.createTransporter({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Development - use Ethereal Email (fake SMTP service for testing)
        // Or configure with your preferred test email service
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'ethereal.user@ethereal.email',
                pass: 'ethereal.pass'
            }
        });
    }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    try {
        const transporter = createTransporter();
        
        const resetURL = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
        
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@petcare.com',
            to: user.email,
            subject: 'Petcare - Password Reset Request',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
                        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🐾 Petcare</h1>
                            <h2>Password Reset Request</h2>
                        </div>
                        <div class="content">
                            <h3>Hello ${user.firstName},</h3>
                            <p>We received a request to reset your password for your Petcare account.</p>
                            <p>Click the button below to reset your password:</p>
                            <div style="text-align: center;">
                                <a href="${resetURL}" class="button">Reset Password</a>
                            </div>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
                                ${resetURL}
                            </p>
                            <div class="warning">
                                <strong>⚠️ Important:</strong>
                                <ul>
                                    <li>This link will expire in <strong>15 minutes</strong></li>
                                    <li>If you didn't request this reset, please ignore this email</li>
                                    <li>Your password will remain unchanged until you create a new one</li>
                                </ul>
                            </div>
                            <p>If you have any questions, please contact our support team.</p>
                            <p>Best regards,<br>The Petcare Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 Petcare - Veterinary Management System</p>
                            <p>This is an automated email, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Hello ${user.firstName},
                
                We received a request to reset your password for your Petcare account.
                
                Please click the following link to reset your password:
                ${resetURL}
                
                This link will expire in 15 minutes.
                
                If you didn't request this reset, please ignore this email.
                
                Best regards,
                The Petcare Team
            `
        };
        
        // For development, just log the email instead of sending it
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n📧 PASSWORD RESET EMAIL (Development Mode)');
            console.log('To:', user.email);
            console.log('Subject:', mailOptions.subject);
            console.log('Reset URL:', resetURL);
            console.log('This email would be sent in production mode.\n');
            return { success: true, resetURL }; // Return URL for development
        }
        
        await transporter.sendMail(mailOptions);
        return { success: true };
        
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
};

// Send password changed confirmation email
const sendPasswordChangedEmail = async (user) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@petcare.com',
            to: user.email,
            subject: 'Petcare - Password Successfully Changed',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                        <h1>🐾 Petcare</h1>
                        <h2>Password Changed Successfully</h2>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h3>Hello ${user.firstName},</h3>
                        <p>This email confirms that your password has been successfully changed.</p>
                        <p><strong>Account Details:</strong></p>
                        <ul>
                            <li>Username: ${user.username}</li>
                            <li>Email: ${user.email}</li>
                            <li>Changed on: ${new Date().toLocaleString()}</li>
                        </ul>
                        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong>🔒 Security Note:</strong> If you didn't make this change, please contact our support team immediately.
                        </div>
                        <p>Best regards,<br>The Petcare Team</p>
                    </div>
                </div>
            `
        };
        
        if (process.env.NODE_ENV !== 'production') {
            console.log('📧 Password changed confirmation email would be sent to:', user.email);
            return { success: true };
        }
        
        await transporter.sendMail(mailOptions);
        return { success: true };
        
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendPasswordChangedEmail
}; 
