// routes/cart.js - Shopping Cart Routes
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { requireAuth } = require('./auth');

// Get user's cart
router.get('/', requireAuth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ 
            user: req.session.userId, 
            status: 'active' 
        }).populate('items.product');

        if (!cart) {
            cart = new Cart({ user: req.session.userId });
            await cart.save();
        }

        res.render('cart/index', {
            title: 'Shopping Cart',
            cart: cart || { items: [], totalItems: 0, totalPrice: 0 }
        });
    } catch (error) {
        console.error('Cart error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

// Add item to cart (AJAX)
router.post('/add', requireAuth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product exists and is in stock
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        if (!product.inStock || product.stock < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient stock' 
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ 
            user: req.session.userId, 
            status: 'active' 
        });

        if (!cart) {
            cart = new Cart({ user: req.session.userId });
        }

        // Add item to cart
        await cart.addItem(productId, product.price, parseInt(quantity));

        // Populate the cart for response
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Product added to cart',
            cart: {
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice,
                formattedTotalPrice: cart.formattedTotalPrice
            }
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding to cart' 
        });
    }
});

// Update item quantity (AJAX)
router.put('/update', requireAuth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ 
            user: req.session.userId, 
            status: 'active' 
        });

        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        // Validate quantity against stock if increasing
        if (quantity > 0) {
            const product = await Product.findById(productId);
            if (!product || product.stock < quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Insufficient stock' 
                });
            }
        }

        await cart.updateItemQuantity(productId, parseInt(quantity));
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Cart updated',
            cart: {
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice,
                formattedTotalPrice: cart.formattedTotalPrice
            }
        });

    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating cart' 
        });
    }
});

// Remove item from cart (AJAX)
router.delete('/remove/:productId', requireAuth, async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ 
            user: req.session.userId, 
            status: 'active' 
        });

        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }

        await cart.removeItem(productId);

        res.json({
            success: true,
            message: 'Item removed from cart',
            cart: {
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice,
                formattedTotalPrice: cart.formattedTotalPrice
            }
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error removing from cart' 
        });
    }
});

// Clear entire cart
router.delete('/clear', requireAuth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ 
            user: req.session.userId, 
            status: 'active' 
        });

        if (cart) {
            await cart.clearCart();
        }

        req.flash('success', 'Cart cleared successfully');
        res.redirect('/cart');

    } catch (error) {
        console.error('Clear cart error:', error);
        req.flash('error', 'Error clearing cart');
        res.redirect('/cart');
    }
});

// Get cart count (AJAX) - for navbar badge
router.get('/count', requireAuth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ 
            user: req.session.userId, 
            status: 'active' 
        });

        res.json({
            success: true,
            count: cart ? cart.totalItems : 0
        });

    } catch (error) {
        console.error('Cart count error:', error);
        res.json({ success: false, count: 0 });
    }
});

module.exports = router; 
