// models/Cart.js - Shopping Cart Model
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0,
        min: 0
    },
    totalPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'ordered', 'abandoned'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    next();
});

// Virtual for formatted total price in MUR
cartSchema.virtual('formattedTotalPrice').get(function() {
    return `Rs ${this.totalPrice.toFixed(2)}`;
});

// Instance method to add item to cart
cartSchema.methods.addItem = function(productId, price, quantity = 1) {
    const existingItemIndex = this.items.findIndex(item => 
        item.product.toString() === productId.toString()
    );

    if (existingItemIndex >= 0) {
        // Update existing item quantity
        this.items[existingItemIndex].quantity += quantity;
        if (this.items[existingItemIndex].quantity <= 0) {
            this.items.splice(existingItemIndex, 1);
        }
    } else if (quantity > 0) {
        // Add new item
        this.items.push({
            product: productId,
            quantity: quantity,
            price: price
        });
    }

    return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
    const itemIndex = this.items.findIndex(item => 
        item.product.toString() === productId.toString()
    );

    if (itemIndex >= 0) {
        if (quantity <= 0) {
            this.items.splice(itemIndex, 1);
        } else {
            this.items[itemIndex].quantity = quantity;
        }
        return this.save();
    }
    
    return Promise.resolve(this);
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(item => 
        item.product.toString() !== productId.toString()
    );
    return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
    this.items = [];
    return this.save();
};

module.exports = mongoose.model('Cart', cartSchema); 
