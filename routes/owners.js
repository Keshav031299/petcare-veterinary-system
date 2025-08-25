const express = require('express');
const router = express.Router();
const Owner = require('../models/Owner');
const Pet = require('../models/Pet');

// List all owners
router.get('/', async (req, res) => {
    try {
        const owners = await Owner.find({ isActive: true }).sort({ lastName: 1 });
        res.render('owners/index', { 
            title: 'Pet Owners',
            owners 
        });
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

// Show form to create new owner
router.get('/new', (req, res) => {
    res.render('owners/new', { 
        title: 'Add New Owner',
        owner: {}
    });
});

// Create new owner
router.post('/', async (req, res) => {
    try {
        const owner = new Owner({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            address: {
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zipCode
            },
            emergencyContact: {
                name: req.body.emergencyName,
                phone: req.body.emergencyPhone,
                relationship: req.body.emergencyRelationship
            }
        });
        
        await owner.save();
        res.redirect('/owners');
    } catch (error) {
        res.render('owners/new', { 
            title: 'Add New Owner',
            owner: req.body,
            error: error.message 
        });
    }
});

// Show specific owner
router.get('/:id', async (req, res) => {
    try {
        const owner = await Owner.findById(req.params.id);
        const pets = await Pet.find({ owner: req.params.id, isActive: true });
        
        if (!owner) {
            return res.status(404).render('404');
        }
        
        res.render('owners/show', { 
            title: `Owner: ${owner.fullName}`,
            owner,
            pets
        });
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

// Show form to edit owner
router.get('/:id/edit', async (req, res) => {
    try {
        const owner = await Owner.findById(req.params.id);
        if (!owner) {
            return res.status(404).render('404');
        }
        res.render('owners/edit', { 
            title: 'Edit Owner',
            owner
        });
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

// Update owner
router.put('/:id', async (req, res) => {
    try {
        const owner = await Owner.findByIdAndUpdate(req.params.id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            address: {
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zipCode
            },
            emergencyContact: {
                name: req.body.emergencyName,
                phone: req.body.emergencyPhone,
                relationship: req.body.emergencyRelationship
            }
        }, { new: true });
        
        res.redirect(`/owners/${owner._id}`);
    } catch (error) {
        const owner = await Owner.findById(req.params.id);
        res.render('owners/edit', { 
            title: 'Edit Owner',
            owner: { ...owner, ...req.body },
            error: error.message 
        });
    }
});

// Delete owner
router.delete('/:id', async (req, res) => {
    try {
        await Owner.findByIdAndUpdate(req.params.id, { isActive: false });
        res.redirect('/owners');
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

module.exports = router; 
