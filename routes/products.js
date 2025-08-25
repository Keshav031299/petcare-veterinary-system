const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Import auth middleware
const { requireAuth, requireAdmin } = require('./auth');

// List all products
router.get('/', async (req, res) => {
    try {
        const { category, search, sort, minPrice, maxPrice, pet, onSale, inStock } = req.query;
        let query = { isActive: true };
        
        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        
        // Pet type filter
        if (pet && pet !== 'all') {
            query.availableFor = { $in: [pet, 'All'] };
        }
        
        // Sale filter
        if (onSale === 'true') {
            query.isOnSale = true;
        }
        
        // Stock filter
        if (inStock === 'true') {
            query.inStock = true;
        }
        
        // Sorting
        let sortOptions = {};
        switch (sort) {
            case 'price_low':
                sortOptions = { price: 1 };
                break;
            case 'price_high':
                sortOptions = { price: -1 };
                break;
            case 'rating':
                sortOptions = { rating: -1 };
                break;
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'popular':
                sortOptions = { popularityScore: -1 };
                break;
            default:
                sortOptions = search ? { score: { $meta: 'textScore' } } : { popularityScore: -1, name: 1 };
        }
        
        const products = await Product.find(query).sort(sortOptions);
        
        // Get all categories for filter dropdown
        const categories = await Product.distinct('category', { isActive: true });
        
        // Get featured products if no filters applied
        const featuredProducts = (!category && !search) ? 
            await Product.find({ isActive: true, isFeatured: true }).limit(4) : [];
        
        res.render('products/index', {
            title: 'Pet Products & Supplies',
            products: products || [],
            categories: categories || [],
            featuredProducts: featuredProducts || [],
            filters: {
                category: category || 'all',
                search: search || '',
                sort: sort || 'default',
                minPrice: minPrice || '',
                maxPrice: maxPrice || '',
                pet: pet || 'all',
                onSale: onSale === 'true',
                inStock: inStock === 'true'
            }
        });
    } catch (error) {
        console.error('Products list error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

// Show product details
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product || !product.isActive) {
            return res.status(404).render('404', { title: '404 - Product Not Found' });
        }
        
        // Get related products (same category, excluding current)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true
        }).limit(4).sort({ popularityScore: -1 });
        
        res.render('products/show', {
            title: `${product.name} - Product Details`,
            product,
            relatedProducts
        });
    } catch (error) {
        console.error('Product details error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

// Show form to create new product (Admin only)
router.get('/admin/new', requireAdmin, (req, res) => {
    res.render('products/new', {
        title: 'Add New Product',
        product: {}
    });
});

// Create new product (Admin only)
router.post('/admin', requireAdmin, async (req, res) => {
    try {
        const {
            name, description, category, brand, price, originalPrice,
            stock, availableFor, size, weight, ageGroup, features,
            ingredients, colors, tags, isFeatured, isOnSale, 
            veterinarianRecommended, images
        } = req.body;
        
        const product = new Product({
            name,
            description,
            category,
            brand,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            stock: parseInt(stock),
            availableFor: Array.isArray(availableFor) ? availableFor : [availableFor],
            size,
            weight,
            ageGroup,
            features: features ? features.split(',').map(f => f.trim()) : [],
            ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [],
            colors: colors ? colors.split(',').map(c => c.trim()) : [],
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            images: images ? [{ url: images, alt: name }] : [],
            isFeatured: isFeatured === 'on',
            isOnSale: isOnSale === 'on',
            veterinarianRecommended: veterinarianRecommended === 'on',
            inStock: parseInt(stock) > 0
        });
        
        await product.save();
        req.flash('success', 'Product created successfully!');
        res.redirect('/products');
    } catch (error) {
        console.error('Product creation error:', error);
        res.render('products/new', {
            title: 'Add New Product',
            product: req.body,
            error: error.message
        });
    }
});

// Show form to edit product (Admin only)
router.get('/:id/edit', requireAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).render('404', { title: '404 - Product Not Found' });
        }
        
        res.render('products/edit', {
            title: 'Edit Product',
            product
        });
    } catch (error) {
        console.error('Product edit form error:', error);
        res.render('error', { error: error.message, title: 'Error' });
    }
});

// Update product (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const {
            name, description, category, brand, price, originalPrice,
            stock, availableFor, size, weight, ageGroup, features,
            ingredients, colors, tags, isFeatured, isOnSale, 
            veterinarianRecommended, images
        } = req.body;
        
        await Product.findByIdAndUpdate(req.params.id, {
            name,
            description,
            category,
            brand,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            stock: parseInt(stock),
            availableFor: Array.isArray(availableFor) ? availableFor : [availableFor],
            size,
            weight,
            ageGroup,
            features: features ? features.split(',').map(f => f.trim()) : [],
            ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [],
            colors: colors ? colors.split(',').map(c => c.trim()) : [],
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            images: images ? [{ url: images, alt: name }] : [],
            isFeatured: isFeatured === 'on',
            isOnSale: isOnSale === 'on',
            veterinarianRecommended: veterinarianRecommended === 'on',
            inStock: parseInt(stock) > 0
        });
        
        req.flash('success', 'Product updated successfully!');
        res.redirect(`/products/${req.params.id}`);
    } catch (error) {
        console.error('Product update error:', error);
        const product = await Product.findById(req.params.id);
        res.render('products/edit', {
            title: 'Edit Product',
            product: { ...product, ...req.body },
            error: error.message
        });
    }
});

// Delete product (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { isActive: false });
        req.flash('success', 'Product deleted successfully!');
        res.redirect('/products');
    } catch (error) {
        console.error('Product deletion error:', error);
        req.flash('error', 'Error deleting product');
        res.redirect('/products');
    }
});

module.exports = router;