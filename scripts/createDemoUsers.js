const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function createDemoUsers() {
    try {
        // Clear existing users (optional)
        await User.deleteMany({});
        
        // Create demo users
        const demoUsers = [
            {
                username: 'admin',
                email: 'admin@petcare.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            },
            {
                username: 'drsmith',
                email: 'drsmith@petcare.com',
                password: 'vet123',
                firstName: 'Dr. John',
                lastName: 'Smith',
                role: 'veterinarian'
            },
            {
                username: 'staff',
                email: 'staff@petcare.com',
                password: 'staff123',
                firstName: 'Jane',
                lastName: 'Doe',
                role: 'staff'
            }
        ];
        
        for (const userData of demoUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Created user: ${user.username} (${user.role})`);
        }
        
        console.log('\n🎉 Demo users created successfully!');
        console.log('\nLogin credentials:');
        console.log('Admin: admin / admin123');
        console.log('Veterinarian: drsmith / vet123');
        console.log('Staff: staff / staff123');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating demo users:', error);
        process.exit(1);
    }
}

createDemoUsers(); 
