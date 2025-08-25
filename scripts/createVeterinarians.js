// scripts/createVeterinarians.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function createVeterinarians() {
    try {
        console.log('Creating veterinarians...');
        
        // Check if veterinarians already exist
        const existingVets = await User.find({ role: 'veterinarian' });
        if (existingVets.length >= 4) {
            console.log(`✅ ${existingVets.length} veterinarians already exist`);
            existingVets.forEach(vet => {
                console.log(`   - ${vet.firstName} ${vet.lastName} (${vet.username})`);
            });
            process.exit(0);
        }
        
        // Create veterinarians
        const veterinarians = [
            {
                username: 'drsmith',
                email: 'dr.smith@petcare.com',
                password: 'vet123',
                firstName: 'Dr. John',
                lastName: 'Smith',
                role: 'veterinarian'
            },
            {
                username: 'drjohnson',
                email: 'dr.johnson@petcare.com',
                password: 'vet123',
                firstName: 'Dr. Sarah',
                lastName: 'Johnson',
                role: 'veterinarian'
            },
            {
                username: 'drbrown',
                email: 'dr.brown@petcare.com',
                password: 'vet123',
                firstName: 'Dr. Michael',
                lastName: 'Brown',
                role: 'veterinarian'
            },
            {
                username: 'drwilson',
                email: 'dr.wilson@petcare.com',
                password: 'vet123',
                firstName: 'Dr. Emily',
                lastName: 'Wilson',
                role: 'veterinarian'
            }
        ];
        
        // Delete existing veterinarians first (if any)
        await User.deleteMany({ role: 'veterinarian' });
        
        for (const vetData of veterinarians) {
            const vet = new User(vetData);
            await vet.save();
            console.log(`✅ Created veterinarian: ${vet.firstName} ${vet.lastName} (${vet.username})`);
        }
        
        console.log('\n🎉 All veterinarians created successfully!');
        console.log('\nLogin credentials for veterinarians:');
        veterinarians.forEach(vet => {
            console.log(`${vet.firstName} ${vet.lastName}: ${vet.username} / vet123`);
        });
        
        // Also ensure admin exists
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            const newAdmin = new User({
                username: 'admin',
                email: 'admin@petcare.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            });
            await newAdmin.save();
            console.log('\n✅ Created admin user: admin / admin123');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating veterinarians:', error);
        process.exit(1);
    }
}

createVeterinarians(); 
