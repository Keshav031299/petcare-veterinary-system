// routes/api.js - CORRECT version that works with your Pet-Owner relationship
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const Owner = require('../models/Owner');
const User = require('../models/User');

// GET PETS FOR OWNER - FIXED to work with your Pet model
router.get('/owners/:ownerId/pets', async (req, res) => {
    try {
        console.log('Getting pets for owner:', req.params.ownerId);
        
        // Your Pet model references 'Owner', so we use the owner field
        const pets = await Pet.find({ owner: req.params.ownerId, isActive: true })
            .select('name species breed age weight color gender')
            .lean();
            
        console.log(`Found ${pets.length} pets for owner ${req.params.ownerId}`);
        
        res.json({ 
            success: true, 
            pets: pets || []
        });
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error loading pets: ' + error.message,
            pets: []
        });
    }
});

// CHECK AVAILABILITY - Works with existing appointment structure
router.get('/availability/:veterinarianId/:date', async (req, res) => {
    try {
        const { veterinarianId, date } = req.params;
        
        console.log('Checking availability for vet:', veterinarianId, 'date:', date);
        
        // Get booked slots for this vet on this date
        const bookedSlots = await Appointment.find({
            veterinarian: veterinarianId,
            appointmentDate: {
                $gte: new Date(date + 'T00:00:00.000Z'),
                $lt: new Date(date + 'T23:59:59.999Z')
            },
            status: { $in: ['scheduled', 'confirmed'] }
        }).select('appointmentTime').lean();
        
        const bookedTimes = bookedSlots.map(slot => slot.appointmentTime);
        console.log('Booked times:', bookedTimes);
        
        // Generate available slots (9 AM to 5 PM, 30-minute intervals)
        const availableSlots = [];
        const timeSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ];
        
        timeSlots.forEach(time => {
            if (!bookedTimes.includes(time)) {
                availableSlots.push(time);
            }
        });
        
        console.log('Available slots:', availableSlots);
        
        res.json({ 
            success: true, 
            date,
            veterinarianId,
            availableSlots,
            bookedSlots: bookedTimes
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking availability: ' + error.message 
        });
    }
});

// GET ALL OWNERS (both Owner and User models)
router.get('/owners', async (req, res) => {
    try {
        const owners = await Owner.find({ isActive: true }).select('firstName lastName email phone').lean();
        const userOwners = await User.find({ role: 'user' }).select('name email phone').lean();
        
        const allOwners = [
            ...owners.map(o => ({ 
                ...o, 
                name: `${o.firstName} ${o.lastName}`, // Create name field for consistency
                type: 'owner' 
            })),
            ...userOwners.map(u => ({ ...u, type: 'user' }))
        ];
        
        res.json({ success: true, owners: allOwners });
    } catch (error) {
        console.error('Error fetching owners:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET VETERINARIANS
router.get('/veterinarians', async (req, res) => {
    try {
        const vets = await User.find({ 
            role: { $in: ['veterinarian', 'admin'] } 
        }).select('name email').lean();
        
        res.json({ success: true, veterinarians: vets });
    } catch (error) {
        console.error('Error fetching veterinarians:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// VALIDATE APPOINTMENT SLOT
router.post('/validate-slot', async (req, res) => {
    try {
        const { veterinarianId, date, time } = req.body;
        
        const existingAppointment = await Appointment.findOne({
            veterinarian: veterinarianId,
            appointmentDate: {
                $gte: new Date(date + 'T00:00:00.000Z'),
                $lt: new Date(date + 'T23:59:59.999Z')
            },
            appointmentTime: time,
            status: { $in: ['scheduled', 'confirmed'] }
        });
        
        const isAvailable = !existingAppointment;
        
        res.json({ 
            success: true, 
            available: isAvailable,
            message: isAvailable ? 'Slot is available' : 'Slot is already booked'
        });
    } catch (error) {
        console.error('Error validating slot:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;