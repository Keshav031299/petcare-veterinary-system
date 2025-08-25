// routes/appointments.js - FIXED to work with your existing Owner/User structure
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Owner = require('../models/Owner');
const Pet = require('../models/Pet');

// GET /appointments - Works with your existing models
router.get('/', async (req, res) => {
    try {
        console.log('Loading appointments...');
        
        // Get appointments 
        const appointments = await Appointment.find({})
            .sort({ appointmentDate: -1, appointmentTime: 1 })
            .lean();
            
        console.log(`Found ${appointments.length} appointments`);
        
        // Get all related data separately 
        const users = await User.find({}).lean();
        const owners = await Owner.find({}).lean();
        const pets = await Pet.find({}).lean();
        
        console.log(`Found ${users.length} users, ${owners.length} owners, ${pets.length} pets`);
        
        // Process appointments and map relationships manually
        const processedAppointments = appointments.map(appointment => {
            let petOwner = { name: 'Unknown Owner' };
            let pet = { name: 'Unknown Pet' };
            let veterinarian = { name: 'Unknown Vet' };
            
            // Find pet first to get the correct owner
            if (appointment.pet) {
                const foundPet = pets.find(p => p._id.toString() === appointment.pet.toString());
                if (foundPet) {
                    pet = foundPet;
                    // Now find the owner using the pet's owner field
                    if (foundPet.owner) {
                        const foundOwner = owners.find(o => o._id.toString() === foundPet.owner.toString());
                        if (foundOwner) {
                            petOwner = {
                                ...foundOwner,
                                name: `${foundOwner.firstName} ${foundOwner.lastName}` // Combine firstName and lastName
                            };
                        } else {
                            // Fallback to User model
                            petOwner = users.find(u => u._id.toString() === foundPet.owner.toString()) || { name: 'Unknown Owner' };
                        }
                    }
                }
            }
            
            // Find veterinarian (should be User)
            if (appointment.veterinarian) {
                veterinarian = users.find(u => u._id.toString() === appointment.veterinarian.toString()) || { name: 'Unknown Vet' };
            }
            
            return {
                ...appointment,
                petOwner,
                pet,
                veterinarian
            };
        });
        
        // Get veterinarians for filter dropdown
        const veterinarians = users.filter(u => u.role === 'veterinarian' || u.role === 'admin');
        
        res.render('appointments/index', {
            title: 'Appointments',
            appointments: processedAppointments,
            veterinarians,
            owners: [...owners, ...users.filter(u => u.role === 'user')], // Combine both Owner and User
            filters: req.query || {}
        });
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        
        // Still render the page with empty data
        res.render('appointments/index', {
            title: 'Appointments',
            appointments: [],
            veterinarians: [],
            owners: [],
            filters: {},
            error: 'Error loading appointments: ' + error.message
        });
    }
});

// GET /appointments/new
router.get('/new', async (req, res) => {
    try {
        // Get both Owner and User models for pet owners
        const owners = await Owner.find({ isActive: true }).sort('firstName').lean();
        const users = await User.find({ role: { $in: ['user', 'owner'] } }).sort('name').lean();
        const veterinarians = await User.find({ role: { $in: ['veterinarian', 'admin'] } }).sort('name').lean();
        
        // Combine owners from both models
        const allOwners = [
            ...owners.map(owner => ({ 
                ...owner, 
                name: `${owner.firstName} ${owner.lastName}`, // Create consistent name field
                type: 'owner' 
            })),
            ...users.map(user => ({ ...user, type: 'user' }))
        ];
        
        res.render('appointments/new', {
            title: 'Schedule New Appointment',
            owners: allOwners,
            veterinarians: veterinarians || []
        });
    } catch (error) {
        console.error('Error loading new appointment form:', error);
        req.flash('error', 'Error loading form');
        res.redirect('/appointments');
    }
});

// POST /appointments
router.post('/', async (req, res) => {
    try {
        const { petOwner, pet, veterinarian, appointmentDate, appointmentTime, reason, notes } = req.body;
        
        // Validation
        if (!petOwner || !pet || !veterinarian || !appointmentDate || !appointmentTime || !reason) {
            req.flash('error', 'Please fill in all required fields');
            return res.redirect('/appointments/new');
        }
        
        // Check for existing appointment at same time (prevent double booking)
        const existingAppointment = await Appointment.findOne({
            veterinarian,
            appointmentDate,
            appointmentTime,
            status: { $in: ['scheduled', 'confirmed'] }
        });
        
        if (existingAppointment) {
            req.flash('error', 'This time slot is already booked. Please select another time.');
            return res.redirect('/appointments/new');
        }
        
        // Create appointment
        const appointment = new Appointment({
            petOwner,
            pet,
            veterinarian,
            appointmentDate: new Date(appointmentDate),
            appointmentTime,
            reason,
            notes: notes || '',
            status: 'scheduled'
        });
        
        await appointment.save();
        console.log('Appointment created:', appointment._id);
        
        req.flash('success', 'Appointment scheduled successfully!');
        res.redirect('/appointments');
        
    } catch (error) {
        console.error('Error creating appointment:', error);
        
        if (error.code === 11000) {
            req.flash('error', 'This time slot is already booked. Please select another time.');
        } else {
            req.flash('error', 'Error creating appointment: ' + error.message);
        }
        
        res.redirect('/appointments/new');
    }
});

// PUT /appointments/:id (for updates)
router.put('/:id', async (req, res) => {
    try {
        const { status, reason, notes } = req.body;
        
        await Appointment.findByIdAndUpdate(req.params.id, {
            status,
            reason,
            notes
        });
        
        req.flash('success', 'Appointment updated successfully!');
        res.redirect('/appointments');
        
    } catch (error) {
        console.error('Error updating appointment:', error);
        req.flash('error', 'Error updating appointment');
        res.redirect('/appointments');
    }
});

// DELETE /appointments/:id
router.delete('/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, {
            status: 'cancelled'
        });
        
        req.flash('success', 'Appointment cancelled successfully');
        res.redirect('/appointments');
        
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        req.flash('error', 'Error cancelling appointment');
        res.redirect('/appointments');
    }
});

module.exports = router;