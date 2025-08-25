// models/Appointment.js - REPLACE YOUR EXISTING MODEL
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    petOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    veterinarian: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true,
        index: true
    },
    appointmentTime: {
        type: String,
        required: true,
        match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    reason: {
        type: String,
        required: true,
        enum: ['checkup', 'vaccination', 'grooming', 'illness', 'emergency', 'surgery', 'consultation']
    },
    notes: {
        type: String,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    // NEW FIELDS FOR ENHANCED FUNCTIONALITY
    notifications: {
        email: {
            sent: { type: Boolean, default: false },
            sentAt: { type: Date }
        }
    },
    duration: {
        type: Number,
        default: 30, // minutes
        min: 15,
        max: 120
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// PREVENT DOUBLE BOOKING - IMPORTANT INDEX
appointmentSchema.index({ 
    veterinarian: 1, 
    appointmentDate: 1, 
    appointmentTime: 1 
}, { 
    unique: true,
    partialFilterExpression: { status: { $in: ['scheduled', 'confirmed'] } }
});

// STATIC METHOD TO CHECK AVAILABILITY
appointmentSchema.statics.isSlotAvailable = async function(veterinarianId, date, time, excludeId = null) {
    const query = {
        veterinarian: veterinarianId,
        appointmentDate: date,
        appointmentTime: time,
        status: { $in: ['scheduled', 'confirmed'] }
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const existingAppointment = await this.findOne(query);
    return !existingAppointment;
};

// STATIC METHOD TO GET AVAILABLE SLOTS
appointmentSchema.statics.getAvailableSlots = async function(veterinarianId, date) {
    const bookedSlots = await this.find({
        veterinarian: veterinarianId,
        appointmentDate: date,
        status: { $in: ['scheduled', 'confirmed'] }
    }).select('appointmentTime');
    
    const bookedTimes = bookedSlots.map(slot => slot.appointmentTime);
    
    // Generate all possible time slots (9 AM to 5 PM, 30-minute intervals)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            if (!bookedTimes.includes(timeString)) {
                allSlots.push(timeString);
            }
        }
    }
    
    return allSlots;
};

module.exports = mongoose.model('Appointment', appointmentSchema);