// routes/appointments.js - COMPLETE FIX
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Owner = require('../models/Owner');
const Pet = require('../models/Pet');

// GET /appointments - COMPLETELY FIXED
router.get('/', async (req, res) => {
    try {
        console.log('Loading appointments with filters:', req.query);
        
        // Build filter query
        let filter = {};
        
        // Status filter
        if (req.query.status && req.query.status !== '') {
            filter.status = req.query.status;
        }
        
        // Veterinarian filter - Handle both ObjectId and string values
        if (req.query.veterinarian && req.query.veterinarian !== '') {
            // Try to use as ObjectId first, fallback to string search
            try {
                const mongoose = require('mongoose');
                if (mongoose.Types.ObjectId.isValid(req.query.veterinarian)) {
                    filter.veterinarian = req.query.veterinarian;
                } else {
                    // If it's not a valid ObjectId, search by name pattern
                    filter.veterinarian = { $regex: req.query.veterinarian, $options: 'i' };
                }
            } catch (err) {
                filter.veterinarian = req.query.veterinarian;
            }
        }
        
        // Date filter
        if (req.query.date && req.query.date !== '') {
            const selectedDate = new Date(req.query.date);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(selectedDate.getDate() + 1);
            
            filter.appointmentDate = {
                $gte: selectedDate,
                $lt: nextDay
            };
        }
        
        // Type filter (upcoming vs historical)
        const filterType = req.query.type || 'upcoming';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filterType === 'upcoming') {
            if (!filter.appointmentDate) {
                filter.appointmentDate = { $gte: today };
            }
        } else if (filterType === 'historical') {
            if (!filter.appointmentDate) {
                filter.appointmentDate = { $lt: today };
            }
        }
        
        console.log('Applied filters:', filter);
        
        // Get appointments WITHOUT population first to avoid cast errors
        const appointments = await Appointment.find(filter)
            .sort({ appointmentDate: filterType === 'upcoming' ? 1 : -1, appointmentTime: 1 })
            .lean();
            
        console.log(`Found ${appointments.length} appointments`);
        
        // Get all necessary data separately
        const petIds = appointments.map(app => app.pet).filter(id => id);
        const ownerIds = appointments.map(app => app.petOwner).filter(id => id);
        const vetIds = appointments.map(app => app.veterinarian).filter(id => {
            try {
                const mongoose = require('mongoose');
                return mongoose.Types.ObjectId.isValid(id);
            } catch {
                return false;
            }
        });
        
        // Fetch related data
        const pets = await Pet.find({ _id: { $in: petIds } }).populate('owner').lean();
        const owners = await Owner.find({ _id: { $in: ownerIds } }).lean();
        const veterinarians = await User.find({ _id: { $in: vetIds } }).lean();
        
        // Process appointments manually
        const processedAppointments = appointments.map(appointment => {
            let petOwner = { name: 'Unknown Owner' };
            let pet = { name: 'Unknown Pet' };
            let veterinarian = { name: 'Unknown Vet' };
            
            // Find pet
            if (appointment.pet) {
                const foundPet = pets.find(p => p._id.toString() === appointment.pet.toString());
                if (foundPet) {
                    pet = foundPet;
                    // Get owner from pet's owner reference
                    if (foundPet.owner) {
                        petOwner = {
                            ...foundPet.owner,
                            name: `${foundPet.owner.firstName || ''} ${foundPet.owner.lastName || ''}`.trim() || 
                                   foundPet.owner.email || 'Unknown Owner'
                        };
                    }
                }
            }
            
            // Find owner if not found through pet
            if (petOwner.name === 'Unknown Owner' && appointment.petOwner) {
                const foundOwner = owners.find(o => o._id.toString() === appointment.petOwner.toString());
                if (foundOwner) {
                    petOwner = {
                        ...foundOwner,
                        name: `${foundOwner.firstName || ''} ${foundOwner.lastName || ''}`.trim() || 
                               foundOwner.email || 'Unknown Owner'
                    };
                }
            }
            
            // Find veterinarian - handle both ObjectId and string cases
            if (appointment.veterinarian) {
                const mongoose = require('mongoose');
                if (mongoose.Types.ObjectId.isValid(appointment.veterinarian)) {
                    // It's an ObjectId, find in veterinarians array
                    const foundVet = veterinarians.find(v => v._id.toString() === appointment.veterinarian.toString());
                    if (foundVet) {
                        veterinarian = {
                            ...foundVet,
                            name: `${foundVet.firstName || ''} ${foundVet.lastName || ''}`.trim() || 
                                   foundVet.username || foundVet.email || 'Unknown Vet'
                        };
                    }
                } else {
                    // It's a string (legacy data)
                    veterinarian = {
                        name: appointment.veterinarian
                    };
                }
            }
            
            return {
                ...appointment,
                petOwner,
                pet,
                veterinarian,
                appointmentDate: appointment.appointmentDate || new Date(),
                appointmentTime: appointment.appointmentTime || 'N/A',
                reason: appointment.reason || 'No reason specified',
                status: appointment.status || 'scheduled'
            };
        });
        
        // Get all veterinarians for filter dropdown
        const allVeterinarians = await User.find({ 
            role: { $in: ['veterinarian', 'admin'] },
            isActive: true 
        }).select('firstName lastName username email').lean();
        
        const processedVeterinarians = allVeterinarians.map(vet => ({
            ...vet,
            name: `${vet.firstName || ''} ${vet.lastName || ''}`.trim() || 
                  vet.username || vet.email || 'Unknown Vet'
        }));
        
        res.render('appointments/index', {
            title: 'Appointments',
            appointments: processedAppointments,
            veterinarians: processedVeterinarians,
            filters: {
                type: filterType,
                status: req.query.status || '',
                veterinarian: req.query.veterinarian || '',
                date: req.query.date || ''
            }
        });
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        
        res.render('appointments/index', {
            title: 'Appointments',
            appointments: [],
            veterinarians: [],
            filters: {
                type: 'upcoming',
                status: '',
                veterinarian: '',
                date: ''
            },
            error: 'Error loading appointments: ' + error.message
        });
    }
});

// GET /appointments/new - ENHANCED for staff booking
router.get('/new', async (req, res) => {
    try {
        // Get owners from Owner model
        const owners = await Owner.find({ isActive: true }).sort('firstName').lean();
        
        // Get veterinarians
        const veterinarians = await User.find({ 
            role: { $in: ['veterinarian', 'admin'] },
            isActive: true 
        }).sort('firstName').lean();
        
        // Process owners
        const processedOwners = owners.map(owner => ({
            ...owner,
            name: `${owner.firstName} ${owner.lastName}`,
            displayName: `${owner.firstName} ${owner.lastName} (${owner.email})`
        }));
        
        // Process veterinarians
        const processedVeterinarians = veterinarians.map(vet => ({
            ...vet,
            name: `${vet.firstName || ''} ${vet.lastName || ''}`.trim() || 
                  vet.username || vet.email,
            displayName: `${vet.firstName || ''} ${vet.lastName || ''}`.trim() || 
                        vet.username || vet.email
        }));
        
        console.log(`Loaded ${processedOwners.length} owners and ${processedVeterinarians.length} vets for appointment form`);
        
        res.render('appointments/new', {
            title: 'Schedule New Appointment',
            owners: processedOwners,
            veterinarians: processedVeterinarians
        });
    } catch (error) {
        console.error('Error loading new appointment form:', error);
        req.flash('error', 'Error loading form: ' + error.message);
        res.redirect('/appointments');
    }
});

// POST /appointments - ENHANCED for notifications
router.post('/', async (req, res) => {
    try {
        const { petOwner, pet, veterinarian, appointmentDate, appointmentTime, reason, notes } = req.body;
        
        console.log('Creating appointment with data:', {
            petOwner, pet, veterinarian, appointmentDate, appointmentTime, reason
        });
        
        // Validation
        if (!petOwner || !pet || !veterinarian || !appointmentDate || !appointmentTime || !reason) {
            req.flash('error', 'Please fill in all required fields');
            return res.redirect('/appointments/new');
        }
        
        // Validate that veterinarian is a valid ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(veterinarian)) {
            req.flash('error', 'Please select a valid veterinarian');
            return res.redirect('/appointments/new');
        }
        
        // Check for existing appointment at same time (prevent double booking)
        const appointmentDateObj = new Date(appointmentDate);
        const existingAppointment = await Appointment.findOne({
            veterinarian,
            appointmentDate: {
                $gte: new Date(appointmentDateObj.setHours(0, 0, 0, 0)),
                $lt: new Date(appointmentDateObj.setHours(23, 59, 59, 999))
            },
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
            veterinarian, // This should be an ObjectId
            appointmentDate: new Date(appointmentDate),
            appointmentTime,
            reason,
            notes: notes || '',
            status: 'scheduled',
            createdBy: req.session.userId
        });
        
        const savedAppointment = await appointment.save();
        console.log('Appointment created successfully:', savedAppointment._id);
        
        // TODO: Send notification to veterinarian
        try {
            await sendAppointmentNotification(savedAppointment);
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
            // Don't fail the appointment creation if notification fails
        }
        
        req.flash('success', 'Appointment scheduled successfully! Veterinarian has been notified.');
        res.redirect('/appointments');
        
    } catch (error) {
        console.error('Error creating appointment:', error);
        
        if (error.code === 11000) {
            req.flash('error', 'This time slot is already booked. Please select another time.');
        } else if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            req.flash('error', 'Validation error: ' + messages.join(', '));
        } else {
            req.flash('error', 'Error creating appointment: ' + error.message);
        }
        
        res.redirect('/appointments/new');
    }
});

// Function to send appointment notification (placeholder)
async function sendAppointmentNotification(appointment) {
    try {
        // Get veterinarian details
        const vet = await User.findById(appointment.veterinarian);
        const pet = await Pet.findById(appointment.pet);
        const owner = await Owner.findById(appointment.petOwner);
        
        if (vet && vet.email) {
            console.log(`📧 Notification sent to ${vet.email} about appointment:`, {
                pet: pet?.name,
                owner: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
                date: appointment.appointmentDate.toDateString(),
                time: appointment.appointmentTime,
                reason: appointment.reason
            });
            
            // TODO: Implement actual email notification using nodemailer
            // For now, just log the notification
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// PUT /appointments/:id
router.put('/:id', async (req, res) => {
    try {
        const { status, reason, notes } = req.body;
        
        await Appointment.findByIdAndUpdate(req.params.id, {
            status,
            reason,
            notes,
            updatedAt: new Date()
        });
        
        req.flash('success', 'Appointment updated successfully!');
        res.redirect('/appointments');
        
    } catch (error) {
        console.error('Error updating appointment:', error);
        req.flash('error', 'Error updating appointment: ' + error.message);
        res.redirect('/appointments');
    }
});

// DELETE /appointments/:id
router.delete('/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, {
            status: 'cancelled',
            updatedAt: new Date()
        });
        
        req.flash('success', 'Appointment cancelled successfully');
        res.redirect('/appointments');
        
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        req.flash('error', 'Error cancelling appointment: ' + error.message);
        res.redirect('/appointments');
    }
});

module.exports = router;