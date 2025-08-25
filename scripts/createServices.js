const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function createServices() {
    try {
        // Clear existing services (optional)
        await Service.deleteMany({});
        console.log('Cleared existing services');
        
        // Sample services data
        const services = [
            // General Care
            {
                name: 'Annual Wellness Exam',
                description: 'Comprehensive physical examination including weight check, temperature, heart rate, vaccination updates, and general health assessment. Essential for maintaining your pet\'s long-term health.',
                category: 'General Care',
                price: 85.00,
                duration: 45,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-stethoscope',
                preparationInstructions: 'Please bring vaccination records and list of current medications. Ensure your pet has not eaten 2 hours before the appointment.',
                followUpRequired: false,
                popularityScore: 95
            },
            {
                name: 'Pet Consultation',
                description: 'Professional consultation for behavioral issues, dietary concerns, or general pet care questions with our experienced veterinarians.',
                category: 'General Care',
                price: 65.00,
                duration: 30,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-comments',
                popularityScore: 75
            },
            {
                name: 'Health Certificate',
                description: 'Official health certificate for travel, boarding, or other requirements. Includes basic health examination and documentation.',
                category: 'General Care',
                price: 45.00,
                duration: 20,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-certificate',
                popularityScore: 40
            },

            // Emergency Services
            {
                name: '24/7 Emergency Care',
                description: 'Round-the-clock emergency veterinary services for critical conditions, accidents, poisoning, and life-threatening situations.',
                category: 'Emergency Services',
                price: 150.00,
                duration: 60,
                availableFor: ['All'],
                requiresAppointment: false,
                isEmergencyService: true,
                icon: 'fas fa-ambulance',
                veterinarianRequired: 'Senior',
                followUpRequired: true,
                popularityScore: 100
            },
            {
                name: 'Urgent Care Visit',
                description: 'Same-day treatment for non-life-threatening conditions that require immediate attention, such as minor injuries or sudden illness.',
                category: 'Emergency Services',
                price: 120.00,
                duration: 45,
                availableFor: ['All'],
                requiresAppointment: false,
                icon: 'fas fa-first-aid',
                popularityScore: 80
            },

            // Surgery
            {
                name: 'Spay/Neuter Surgery',
                description: 'Safe and professional spaying or neutering procedures with pre-operative examination, surgery, and post-operative care instructions.',
                category: 'Surgery',
                price: 275.00,
                duration: 120,
                availableFor: ['Dog', 'Cat'],
                requiresAppointment: true,
                icon: 'fas fa-user-md',
                preparationInstructions: 'No food or water after midnight before surgery. Pre-operative blood work may be required.',
                followUpRequired: true,
                veterinarianRequired: 'Specialist',
                popularityScore: 90
            },
            {
                name: 'Soft Tissue Surgery',
                description: 'Advanced surgical procedures for masses, cysts, wounds, and other soft tissue conditions requiring surgical intervention.',
                category: 'Surgery',
                price: 450.00,
                duration: 180,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-cut',
                preparationInstructions: 'Pre-operative consultation required. Fasting instructions will be provided.',
                followUpRequired: true,
                veterinarianRequired: 'Specialist',
                popularityScore: 60
            },

            // Dental Care
            {
                name: 'Dental Cleaning',
                description: 'Professional dental cleaning under anesthesia including scaling, polishing, and oral examination to prevent dental disease.',
                category: 'Dental Care',
                price: 320.00,
                duration: 90,
                availableFor: ['Dog', 'Cat'],
                requiresAppointment: true,
                icon: 'fas fa-tooth',
                preparationInstructions: 'Pre-anesthetic blood work required. No food after midnight before procedure.',
                followUpRequired: true,
                popularityScore: 85
            },
            {
                name: 'Dental Examination',
                description: 'Comprehensive oral examination to assess dental health, identify problems, and recommend treatment options.',
                category: 'Dental Care',
                price: 55.00,
                duration: 30,
                availableFor: ['Dog', 'Cat'],
                requiresAppointment: true,
                icon: 'fas fa-search',
                popularityScore: 70
            },

            // Diagnostics
            {
                name: 'Blood Work Panel',
                description: 'Complete blood chemistry panel and CBC to assess organ function, detect diseases, and monitor overall health status.',
                category: 'Diagnostics',
                price: 125.00,
                duration: 30,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-vial',
                preparationInstructions: 'Fasting for 12 hours may be required for certain tests.',
                popularityScore: 80
            },
            {
                name: 'Digital X-Ray',
                description: 'High-quality digital radiography for diagnosing bone fractures, internal conditions, and monitoring treatment progress.',
                category: 'Diagnostics',
                price: 180.00,
                duration: 45,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-x-ray',
                popularityScore: 75
            },
            {
                name: 'Ultrasound Examination',
                description: 'Non-invasive ultrasound imaging for examining internal organs, diagnosing pregnancy, and detecting abnormalities.',
                category: 'Diagnostics',
                price: 250.00,
                duration: 60,
                availableFor: ['Dog', 'Cat'],
                requiresAppointment: true,
                icon: 'fas fa-wave-square',
                veterinarianRequired: 'Specialist',
                popularityScore: 65
            },

            // Grooming
            {
                name: 'Full Service Grooming',
                description: 'Complete grooming service including bath, brush, nail trim, ear cleaning, and styling. Professional grooming for all coat types.',
                category: 'Grooming',
                price: 75.00,
                duration: 120,
                availableFor: ['Dog', 'Cat'],
                requiresAppointment: true,
                icon: 'fas fa-cut',
                preparationInstructions: 'Please inform us of any skin conditions or sensitivities.',
                popularityScore: 70
            },
            {
                name: 'Nail Trim & Ear Cleaning',
                description: 'Professional nail trimming and ear cleaning service to maintain your pet\'s hygiene and comfort.',
                category: 'Grooming',
                price: 25.00,
                duration: 20,
                availableFor: ['All'],
                requiresAppointment: false,
                icon: 'fas fa-cut',
                popularityScore: 85
            },

            // Specialty Care
            {
                name: 'Cardiology Consultation',
                description: 'Specialized cardiac examination including EKG, echocardiogram, and treatment planning for heart conditions.',
                category: 'Specialty Care',
                price: 350.00,
                duration: 90,
                availableFor: ['Dog', 'Cat'],
                requiresAppointment: true,
                icon: 'fas fa-heartbeat',
                veterinarianRequired: 'Specialist',
                followUpRequired: true,
                popularityScore: 45
            },
            {
                name: 'Dermatology Treatment',
                description: 'Specialized treatment for skin conditions, allergies, and dermatological issues with customized treatment plans.',
                category: 'Specialty Care',
                price: 180.00,
                duration: 60,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-hand-holding-medical',
                veterinarianRequired: 'Specialist',
                popularityScore: 55
            },

            // Preventive Care
            {
                name: 'Vaccination Package',
                description: 'Complete vaccination series including core and non-core vaccines based on your pet\'s lifestyle and risk factors.',
                category: 'Preventive Care',
                price: 95.00,
                duration: 30,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-syringe',
                followUpRequired: true,
                popularityScore: 95
            },
            {
                name: 'Parasite Prevention',
                description: 'Comprehensive parasite prevention including heartworm, flea, and tick prevention with customized protection plans.',
                category: 'Preventive Care',
                price: 65.00,
                duration: 25,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-shield-alt',
                followUpRequired: false,
                popularityScore: 90
            },

            // Wellness Programs
            {
                name: 'Puppy/Kitten Wellness Plan',
                description: 'Comprehensive wellness program for young pets including multiple visits, vaccinations, and developmental monitoring.',
                category: 'Wellness Programs',
                price: 299.00,
                duration: 45,
                availableFor: ['Dog', 'Cat'],
                requiresAppointment: true,
                icon: 'fas fa-baby',
                preparationInstructions: 'Bring any previous medical records and vaccination history.',
                followUpRequired: true,
                popularityScore: 80
            },
            {
                name: 'Senior Pet Care Package',
                description: 'Specialized care package for senior pets including comprehensive exams, blood work, and age-appropriate health monitoring.',
                category: 'Wellness Programs',
                price: 195.00,
                duration: 60,
                availableFor: ['All'],
                requiresAppointment: true,
                icon: 'fas fa-user-clock',
                followUpRequired: true,
                popularityScore: 70
            }
        ];
        
        // Insert services
        for (const serviceData of services) {
            const service = new Service(serviceData);
            await service.save();
            console.log(`✅ Created service: ${service.name} - ${service.category}`);
        }
        
        console.log(`\n🎉 Successfully created ${services.length} services!`);
        console.log('\nService categories created:');
        
        const categories = [...new Set(services.map(s => s.category))];
        categories.forEach(category => {
            const count = services.filter(s => s.category === category).length;
            console.log(`  • ${category}: ${count} services`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating services:', error);
        process.exit(1);
    }
}

createServices(); 
