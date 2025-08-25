const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
            'Food & Treats',
            'Toys & Entertainment',
            'Health & Wellness',
            'Grooming & Hygiene',
            'Beds & Furniture',
            'Collars & Leashes',
            'Carriers & Travel',
            'Training & Behavior',
            'Litter & Waste Management',
            'Aquarium & Fish Care',
            'Bird Supplies',
            'Small Animal Care'
        ]
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    images: [{
        url: String,
        alt: String
    }],
    availableFor: [{
        type: String,
        enum: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'All']
    }],
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'One Size']
    },
    weight: {
        type: String // e.g., "2.5 kg", "500g"
    },
    ageGroup: {
        type: String,
        enum: ['Puppy/Kitten', 'Adult', 'Senior', 'All Ages']
    },
    features: [String],
    ingredients: [String], // For food products
    nutritionalInfo: {
        protein: String,
        fat: String,
        fiber: String,
        moisture: String
    },
    dimensions: {
        length: String,
        width: String,
        height: String
    },
    colors: [String],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: [String],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isOnSale: {
        type: Boolean,
        default: false
    },
    inStock: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    veterinarianRecommended: {
        type: Boolean,
        default: false
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
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

// Virtual for formatted original price
productSchema.virtual('formattedOriginalPrice').get(function() {
    if (this.originalPrice) {
        return `$${this.originalPrice.toFixed(2)}`;
    }
    return null;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock < 5) return 'Low Stock';
    return 'In Stock';
});

// Virtual for star rating
productSchema.virtual('starRating').get(function() {
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return {
        full: fullStars,
        half: hasHalfStar ? 1 : 0,
        empty: emptyStars
    };
});

module.exports = mongoose.model('Product', productSchema); 
