const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const Owner = require('../models/Owner');
const Appointment = require('../models/Appointment');

// List all pets
router.get('/', async (req, res) => {
    try {
        const pets = await Pet.find({ isActive: true })
            .populate('owner')
            .sort({ name: 1 });
        res.render('pets/index', { 
            title: 'Pets',
            pets 
        });
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

// Show form to create new pet
router.get('/new', async (req, res) => {
    try {
        const owners = await Owner.find({ isActive: true }).sort({ lastName: 1 });
        res.render('pets/new', { 
            title: 'Add New Pet',
            pet: {},
            owners
        });
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

// Create new pet
router.post('/', async (req, res) => {
    try {
        const pet = new Pet({
            name: req.body.name,
            species: req.body.species,
            breed: req.body.breed,
            age: req.body.age,
            weight: req.body.weight,
            color: req.body.color,
            gender: req.body.gender,
            owner: req.body.owner
        });
        
        await pet.save();
        res.redirect('/pets');
    } catch (error) {
        const owners = await Owner.find({ isActive: true }).sort({ lastName: 1 });
        res.render('pets/new', { 
            title: 'Add New Pet',
            pet: req.body,
            owners,
            error: error.message 
        });
    }
});

// Show specific pet
router.get('/:id', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id).populate('owner');
        const appointments = await Appointment.find({ pet: req.params.id })
            .sort({ appointmentDate: -1 })
            .limit(10);
        
        if (!pet) {
            return res.status(404).render('404');
        }
        
        res.render('pets/show', { 
            title: `Pet: ${pet.name}`,
            pet,
            appointments
        });
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

// Show form to edit pet
router.get('/:id/edit', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        const owners = await Owner.find({ isActive: true }).sort({ lastName: 1 });
        
        if (!pet) {
            return res.status(404).render('404');
        }
        
        res.render('pets/edit', { 
            title: 'Edit Pet',
            pet,
            owners
        });
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

// Update pet
router.put('/:id', async (req, res) => {
    try {
        const pet = await Pet.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            species: req.body.species,
            breed: req.body.breed,
            age: req.body.age,
            weight: req.body.weight,
            color: req.body.color,
            gender: req.body.gender,
            owner: req.body.owner
        }, { new: true });
        
        res.redirect(`/pets/${pet._id}`);
    } catch (error) {
        const owners = await Owner.find({ isActive: true }).sort({ lastName: 1 });
        const pet = await Pet.findById(req.params.id);
        res.render('pets/edit', { 
            title: 'Edit Pet',
            pet: { ...pet, ...req.body },
            owners,
            error: error.message 
        });
    }
});

// Delete pet
router.delete('/:id', async (req, res) => {
    try {
        await Pet.findByIdAndUpdate(req.params.id, { isActive: false });
        res.redirect('/pets');
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

// Add medical history
router.post('/:id/medical', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        pet.medicalHistory.push({
            condition: req.body.condition,
            treatment: req.body.treatment,
            notes: req.body.notes
        });
        await pet.save();
        res.redirect(`/pets/${pet._id}`);
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

module.exports = router; 
