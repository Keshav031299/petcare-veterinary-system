// scripts/cleanupAppointments.js
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function cleanupAppointments() {
    try {
        console.log('🧹 Cleaning up appointments data...');
        
        // Get all appointments
        const appointments = await Appointment.find().lean();
        console.log(`Found ${appointments.length} appointments to check`);
        
        // Get all veterinarians for reference
        const veterinarians = await User.find({ 
            role: { $in: ['veterinarian', 'admin'] } 
        }).lean();
        
        console.log(`Found ${veterinarians.length} veterinarians:`);
        veterinarians.forEach(vet => {
            console.log(`  - ${vet.firstName} ${vet.lastName} (${vet._id})`);
        });
        
        let fixedCount = 0;
        let deletedCount = 0;
        
        for (const appointment of appointments) {
            let needsUpdate = false;
            let updateData = {};
            
            // Check if veterinarian field is a string instead of ObjectId
            if (appointment.veterinarian && !mongoose.Types.ObjectId.isValid(appointment.veterinarian)) {
                console.log(`❌ Found invalid veterinarian: "${appointment.veterinarian}"`);
                
                // Try to find matching veterinarian by name
                const vetName = appointment.veterinarian.toString().toLowerCase();
                let matchedVet = null;
                
                for (const vet of veterinarians) {
                    const fullName = `${vet.firstName} ${vet.lastName}`.toLowerCase();
                    const firstName = vet.firstName.toLowerCase();
                    const lastName = vet.lastName.toLowerCase();
                    
                    if (fullName.includes(vetName) || 
                        vetName.includes(firstName) || 
                        vetName.includes(lastName) ||
                        vetName === vet.username?.toLowerCase()) {
                        matchedVet = vet;
                        break;
                    }
                }
                
                if (matchedVet) {
                    updateData.veterinarian = matchedVet._id;
                    needsUpdate = true;
                    console.log(`  ✅ Matched "${appointment.veterinarian}" to ${matchedVet.firstName} ${matchedVet.lastName}`);
                } else {
                    // If no match found, assign to first veterinarian or delete
                    if (veterinarians.length > 0) {
                        updateData.veterinarian = veterinarians[0]._id;
                        needsUpdate = true;
                        console.log(`  ⚠️  No match for "${appointment.veterinarian}", assigned to ${veterinarians[0].firstName} ${veterinarians[0].lastName}`);
                    } else {
                        // Delete appointment if no veterinarians exist
                        await Appointment.findByIdAndDelete(appointment._id);
                        deletedCount++;
                        console.log(`  🗑️  Deleted appointment with invalid vet and no replacements`);
                        continue;
                    }
                }
            }
            
            // Update the appointment if needed
            if (needsUpdate) {
                await Appointment.findByIdAndUpdate(appointment._id, updateData);
                fixedCount++;
            }
        }
        
        console.log('\n🎉 Cleanup completed!');
        console.log(`✅ Fixed ${fixedCount} appointments`);
        console.log(`🗑️  Deleted ${deletedCount} invalid appointments`);
        
        // Verify the fix
        const remainingAppointments = await Appointment.find().lean();
        console.log(`📊 Total appointments after cleanup: ${remainingAppointments.length}`);
        
        // Check for any remaining invalid veterinarian references
        let invalidCount = 0;
        for (const app of remainingAppointments) {
            if (app.veterinarian && !mongoose.Types.ObjectId.isValid(app.veterinarian)) {
                invalidCount++;
            }
        }
        
        if (invalidCount === 0) {
            console.log('✅ All veterinarian references are now valid ObjectIds!');
        } else {
            console.log(`❌ Still found ${invalidCount} invalid veterinarian references`);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupAppointments(); 
