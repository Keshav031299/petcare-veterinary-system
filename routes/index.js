const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const Owner = require('../models/Owner');
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

// Dashboard page
router.get('/dashboard', async (req, res) => {
    try {
        const totalPets = await Pet.countDocuments({ isActive: true });
        const totalOwners = await Owner.countDocuments({ isActive: true });
        const totalAppointments = await Appointment.countDocuments();
        const todayAppointments = await Appointment.countDocuments({
            appointmentDate: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999)
            },
            status: 'Scheduled'
        });

        const recentAppointments = await Appointment.find()
            .populate('pet')
            .populate('owner')
            .sort({ appointmentDate: -1 })
            .limit(5);

        res.render('index', {
            title: 'Petcare - Dashboard',
            totalPets,
            totalOwners,
            totalAppointments,
            todayAppointments,
            recentAppointments
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

module.exports = router;