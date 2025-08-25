const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// List all services
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };
        
        // Filter by category if specified
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        const services = await Service.find(query)
            .sort(search ? { score: { $meta: 'textScore' } } : { popularityScore: -1, name: 1 });
        
        // Get all categories for filter dropdown
        const categories = await Service.distinct('category', { isActive: true });
        
        res.render('services/index', {
            title: 'Our Services',
            services,
            categories,
            currentCategory: category || 'all',
            searchQuery: search || ''
        });
    } catch (error) {
        console.error('Services list error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

// Show service details
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        
        if (!service || !service.isActive) {
            return res.status(404).render('404', { title: '404 - Service Not Found' });
        }
        
        // Get related services (same category, excluding current)
        const relatedServices = await Service.find({
            category: service.category,
            _id: { $ne: service._id },
            isActive: true
        }).limit(3).sort({ popularityScore: -1 });
        
        res.render('services/show', {
            title: `${service.name} - Service Details`,
            service,
            relatedServices
        });
    } catch (error) {
        console.error('Service details error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

// Show form to create new service (Admin only)
router.get('/admin/new', requireAdmin, (req, res) => {
    res.render('services/new', {
        title: 'Add New Service',
        service: {}
    });
});

// Create new service (Admin only)
router.post('/admin', requireAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            duration,
            availableFor,
            requiresAppointment,
            isEmergencyService,
            preparationInstructions,
            followUpRequired,
            veterinarianRequired,
            icon
        } = req.body;
        
        const service = new Service({
            name,
            description,
            category,
            price: parseFloat(price),
            duration: parseInt(duration),
            availableFor: Array.isArray(availableFor) ? availableFor : [availableFor],
            requiresAppointment: requiresAppointment === 'on',
            isEmergencyService: isEmergencyService === 'on',
            preparationInstructions,
            followUpRequired: followUpRequired === 'on',
            veterinarianRequired,
            icon: icon || 'fas fa-stethoscope'
        });
        
        await service.save();
        req.flash('success', 'Service created successfully!');
        res.redirect('/services');
    } catch (error) {
        console.error('Service creation error:', error);
        res.render('services/new', {
            title: 'Add New Service',
            service: req.body,
            error: error.message
        });
    }
});

// Show form to edit service (Admin only)
router.get('/:id/edit', requireAdmin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        
        if (!service) {
            return res.status(404).render('404', { title: '404 - Service Not Found' });
        }
        
        res.render('services/edit', {
            title: 'Edit Service',
            service
        });
    } catch (error) {
        console.error('Service edit form error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

// Update service (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            duration,
            availableFor,
            requiresAppointment,
            isEmergencyService,
            preparationInstructions,
            followUpRequired,
            veterinarianRequired,
            icon
        } = req.body;
        
        await Service.findByIdAndUpdate(req.params.id, {
            name,
            description,
            category,
            price: parseFloat(price),
            duration: parseInt(duration),
            availableFor: Array.isArray(availableFor) ? availableFor : [availableFor],
            requiresAppointment: requiresAppointment === 'on',
            isEmergencyService: isEmergencyService === 'on',
            preparationInstructions,
            followUpRequired: followUpRequired === 'on',
            veterinarianRequired,
            icon: icon || 'fas fa-stethoscope'
        });
        
        req.flash('success', 'Service updated successfully!');
        res.redirect(`/services/${req.params.id}`);
    } catch (error) {
        console.error('Service update error:', error);
        const service = await Service.findById(req.params.id);
        res.render('services/edit', {
            title: 'Edit Service',
            service: { ...service, ...req.body },
            error: error.message
        });
    }
});

// Delete service (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await Service.findByIdAndUpdate(req.params.id, { isActive: false });
        req.flash('success', 'Service deleted successfully!');
        res.redirect('/services');
    } catch (error) {
        console.error('Service deletion error:', error);
        req.flash('error', 'Error deleting service');
        res.redirect('/services');
    }
});

// Book service (redirect to appointment booking)
router.post('/:id/book', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        
        if (!service || !service.isActive) {
            req.flash('error', 'Service not found');
            return res.redirect('/services');
        }
        
        // Redirect to appointment booking with service pre-selected
        res.redirect(`/appointments/new?service=${service._id}`);
    } catch (error) {
        console.error('Service booking error:', error);
        req.flash('error', 'Error booking service');
        res.redirect('/services');
    }
});

// Middleware functions (assuming they exist in auth routes)
function requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.user.role !== 'admin') {
        req.flash('error', 'Access denied. Admin privileges required.');
        return res.redirect('/services');
    }
    next();
}

module.exports = router; 
