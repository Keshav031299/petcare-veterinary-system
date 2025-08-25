const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const moment = require('moment'); // ADD THIS
const rateLimit = require('express-rate-limit'); // ADD THIS
require('dotenv').config();

const app = express();

// Rate limiting for API endpoints (ADD THIS)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// Global variables for templates (ENHANCED)
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.userId;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.moment = moment; // ADD THIS - Make moment available in templates
    next();
});

// Import authentication middleware
const { requireAuth } = require('./routes/auth');

// Routes
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const serviceRoutes = require('./routes/services');
const productRoutes = require('./routes/products');
const petRoutes = require('./routes/pets');
const appointmentRoutes = require('./routes/appointments');
const ownerRoutes = require('./routes/owners');
const apiRoutes = require('./routes/api'); // ADD THIS - New API routes

// Public routes (no authentication required)
app.use('/auth', authRoutes);

// Redirect root to login if not authenticated, otherwise show dashboard
app.get('/', (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    next();
});

// API routes with rate limiting (ADD THIS)
app.use('/api', apiLimiter, requireAuth, apiRoutes);

// Protected routes (authentication required)
app.use('/', requireAuth, indexRoutes);
app.use('/services', requireAuth, serviceRoutes);
app.use('/products', requireAuth, productRoutes);
app.use('/pets', requireAuth, petRoutes);
app.use('/appointments', requireAuth, appointmentRoutes);
app.use('/owners', requireAuth, ownerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        error: err.message,
        title: 'Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        error: 'Page not found',
        title: '404 - Page Not Found' 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Petcare server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}/auth/login`);
});