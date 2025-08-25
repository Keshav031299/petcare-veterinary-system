// routes/index.js - COMPLETE FIX
const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const Owner = require('../models/Owner');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Home page
router.get('/', async (req, res) => {
    try {
        res.render('home', {
            title: 'Welcome to Petcare'
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

// Dashboard page - COMPLETELY FIXED
router.get('/dashboard', async (req, res) => {
    try {
        console.log('Loading dashboard...');
        
        // Get statistics
        const totalPets = await Pet.countDocuments({ isActive: true });
        const totalOwners = await Owner.countDocuments({ isActive: true });
        const totalAppointments = await Appointment.countDocuments();
        
        // Today's appointments count
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const todayAppointments = await Appointment.countDocuments({
            appointmentDate: {
                $gte: todayStart,
                $lte: todayEnd
            },
            status: { $in: ['scheduled', 'confirmed'] }
        });

        // Get recent appointments WITHOUT population to avoid cast errors
        const recentAppointments = await Appointment.find()
            .sort({ appointmentDate: -1, appointmentTime: -1 })
            .limit(10)
            .lean();

        console.log(`Found ${recentAppointments.length} recent appointments`);

        // Get related data separately
        const petIds = recentAppointments.map(app => app.pet).filter(id => id);
        const ownerIds = recentAppointments.map(app => app.petOwner).filter(id => id);
        const vetIds = recentAppointments.map(app => app.veterinarian).filter(id => {
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

        // Process appointments manually to avoid population errors
        const processedAppointments = recentAppointments.map(appointment => {
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

        console.log('Dashboard data loaded successfully:', {
            totalPets,
            totalOwners,
            totalAppointments,
            todayAppointments,
            recentAppointmentsCount: processedAppointments.length
        });

        res.render('index', {
            title: 'Petcare - Dashboard',
            totalPets,
            totalOwners,
            totalAppointments,
            todayAppointments,
            recentAppointments: processedAppointments
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('index', {
            title: 'Petcare - Dashboard',
            totalPets: 0,
            totalOwners: 0,
            totalAppointments: 0,
            todayAppointments: 0,
            recentAppointments: [],
            error: 'Error loading dashboard data: ' + error.message
        });
    }
});

module.exports = router;