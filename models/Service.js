const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'General Care',
            'Emergency Services',
            'Surgery',
            'Dental Care',
            'Diagnostics',
            'Grooming',
            'Specialty Care',
            'Preventive Care',
            'Wellness Programs'
        ]
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number, // Duration in minutes
        required: true,
        min: 15
    },
    availableFor: [{
        type: String,
        enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'All']
    }],
    requiresAppointment: {
        type: Boolean,
        default: true
    },
    isEmergencyService: {
        type: Boolean,
        default: false
    },
    preparationInstructions: {
        type: String,
        trim: true
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    veterinarianRequired: {
        type: String,
        enum: ['Any', 'Specialist', 'Senior'],
        default: 'Any'
    },
    icon: {
        type: String, // FontAwesome icon class
        default: 'fas fa-stethoscope'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    popularityScore: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

// Virtual for formatted duration
serviceSchema.virtual('formattedDuration').get(function() {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    
    if (hours === 0) {
        return `${minutes} min`;
    } else if (minutes === 0) {
        return `${hours} hr`;
    } else {
        return `${hours}h ${minutes}m`;
    }
});

module.exports = mongoose.model('Service', serviceSchema); 
