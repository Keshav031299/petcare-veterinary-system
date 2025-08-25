# Petcare - Veterinary Management System

A complete veterinary service management application built with Node.js, Express.js, MongoDB, EJS, and Bootstrap.

## Features

- **Dashboard**: Overview of pets, owners, and appointments
- **Owner Management**: Add, edit, view, and manage pet owners
- **Pet Management**: Comprehensive pet records with medical history
- **Appointment Scheduling**: Schedule and manage veterinary appointments
- **Responsive Design**: Modern Bootstrap-based UI
- **Real-time Statistics**: Dashboard with key metrics

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templating engine, Bootstrap 5
- **Additional**: Font Awesome icons, Method Override for REST operations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation Steps

1. **Clone or create the project directory**
   ```bash
   mkdir petcare
   cd petcare
   ```

2. **Initialize the project and install dependencies**
   ```bash
   npm init -y
   npm install express mongoose ejs body-parser method-override express-session bcryptjs dotenv
   npm install -D nodemon
   ```

3. **Create the folder structure**
   ```
   petcare/
   ├── models/
   ├── routes/
   ├── views/
   │   ├── partials/
   │   ├── owners/
   │   ├── pets/
   │   └── appointments/
   ├── public/
   ├── .env
   ├── app.js
   └── package.json
   ```

4. **Copy all the provided code files to their respective locations**

5. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/petcare
   SESSION_SECRET=your_secret_key_here
   ```

6. **Start MongoDB**
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Update the MONGODB_URI in .env

7. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

8. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
petcare/
├── app.js                 # Main application file
├── package.json          # Project dependencies
├── .env                  # Environment variables
├── models/               # Database models
│   ├── Owner.js
│   ├── Pet.js
│   └── Appointment.js
├── routes/               # Route handlers
│   ├── index.js
│   ├── owners.js
│   ├── pets.js
│   └── appointments.js
└── views/                # EJS templates
    ├── index.ejs
    ├── 404.ejs
    ├── partials/
    │   ├── header.ejs
    │   └── footer.ejs
    └── owners/
        ├── index.ejs
        ├── new.ejs
        ├── show.ejs
        └── edit.ejs
```

## Usage

### Adding Owners
1. Navigate to "Owners" in the navigation
2. Click "Add New Owner"
3. Fill in the owner details including contact and emergency information
4. Save to create the owner record

### Adding Pets
1. Navigate to "Pets" in the navigation
2. Click "Add New Pet"
3. Select the owner and fill in pet details
4. Save to create the pet record

### Scheduling Appointments
1. Navigate to "Appointments" in the navigation
2. Click "Schedule New Appointment"
3. Select owner and pet, set date/time and reason
4. Save to schedule the appointment

### Dashboard Overview
The dashboard provides:
- Total counts of pets, owners, and appointments
- Today's scheduled appointments
- Recent appointment history
- Quick action buttons

## Complete File Structure

After setting up, your project should look like this:

```
petcare/
├── app.js                          # Main application file
├── package.json                    # Dependencies and scripts
├── .env                           # Environment variables
├── install.sh                     # Setup script
├── README.md                      # This file
├── models/                        # Database models
│   ├── Owner.js                   # Pet owner model
│   ├── Pet.js                     # Pet model
│   └── Appointment.js             # Appointment model
├── routes/                        # Route handlers
│   ├── index.js                   # Dashboard routes
│   ├── owners.js                  # Owner CRUD routes
│   ├── pets.js                    # Pet CRUD routes
│   └── appointments.js            # Appointment CRUD routes
├── views/                         # EJS templates
│   ├── index.ejs                  # Dashboard page
│   ├── 404.ejs                    # 404 error page
│   ├── error.ejs                  # General error page
│   ├── partials/                  # Reusable components
│   │   ├── header.ejs             # Header partial
│   │   └── footer.ejs             # Footer partial
│   ├── owners/                    # Owner views
│   │   ├── index.ejs              # List owners
│   │   ├── new.ejs                # Add new owner
│   │   ├── show.ejs               # View owner details
│   │   └── edit.ejs               # Edit owner
│   ├── pets/                      # Pet views
│   │   ├── index.ejs              # List pets
│   │   ├── new.ejs                # Add new pet
│   │   ├── show.ejs               # View pet details
│   │   └── edit.ejs               # Edit pet
│   └── appointments/              # Appointment views
│       ├── index.ejs              # List appointments
│       ├── new.ejs                # Schedule appointment
│       ├── show.ejs               # View appointment
│       └── edit.ejs               # Edit appointment
└── public/                        # Static files (optional)
    ├── css/                       # Custom CSS
    ├── js/                        # Custom JavaScript
    └── images/                    # Images
```

## API Endpoints

### Dashboard
- `GET /` - Dashboard with statistics

### Owners
- `GET /owners` - List all owners
- `GET /owners/new` - Show new owner form
- `POST /owners` - Create new owner
- `GET /owners/:id` - View owner details
- `GET /owners/:id/edit` - Show edit owner form
- `PUT /owners/:id` - Update owner
- `DELETE /owners/:id` - Delete owner

### Pets
- `GET /pets` - List all pets
- `GET /pets/new` - Show new pet form
- `POST /pets` - Create new pet
- `GET /pets/:id` - View pet details
- `GET /pets/:id/edit` - Show edit pet form
- `PUT /pets/:id` - Update pet
- `DELETE /pets/:id` - Delete pet
- `POST /pets/:id/medical` - Add medical record

### Appointments
- `GET /appointments` - List all appointments
- `GET /appointments/new` - Show new appointment form
- `POST /appointments` - Create new appointment
- `GET /appointments/:id` - View appointment details
- `GET /appointments/:id/edit` - Show edit appointment form
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment
- `GET /appointments/api/owner/:ownerId/pets` - Get pets for owner (AJAX)

## Features Included

✅ **Complete CRUD Operations** for all entities
✅ **Responsive Bootstrap UI** with modern design
✅ **Dashboard** with real-time statistics
✅ **Medical History** tracking for pets
✅ **Appointment Scheduling** with time slots
✅ **Owner-Pet Relationships** properly linked
✅ **Error Handling** and validation
✅ **Search and Filter** capabilities
✅ **Mobile-Friendly** design
✅ **Professional Styling** with Font Awesome icons

## Quick Start Commands

```bash
# Clone/setup the project
mkdir petcare && cd petcare

# Make install script executable and run it
chmod +x install.sh
./install.sh

# Start MongoDB (in separate terminal)
mongod

# Run the application in development mode
npm run dev

# Or run in production mode
npm start
```

## Database Schema

### Owner
- firstName, lastName, email, phone
- address (street, city, state, zipCode)
- emergencyContact (name, phone, relationship)
- timestamps and isActive flag

### Pet
- name, species, breed, age, weight, color, gender
- owner reference
- medicalHistory array with condition, treatment, notes
- timestamps and isActive flag

### Appointment
- pet and owner references
- appointmentDate, appointmentTime, reason
- status (Scheduled, Completed, Cancelled, No Show)
- veterinarian, notes, diagnosis, treatment, cost
- timestamps 
