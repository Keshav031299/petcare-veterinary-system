// scripts/createProductsMUR.js - Updated with Mauritian Rupees pricing
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function createProductsMUR() {
    try {
        // Clear existing products (optional)
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        // Sample products data with MUR pricing
        const products = [
            // Food & Treats
            {
                name: 'Royal Canin Adult Dog Food',
                description: 'Complete and balanced nutrition for adult dogs with high-quality protein and essential nutrients. Supports healthy digestion and maintains ideal body condition.',
                category: 'Food & Treats',
                brand: 'Royal Canin',
                price: 2599.00, // ~Rs 2,600 (was $59.99)
                originalPrice: 2999.00, // ~Rs 3,000 (was $69.99)
                stock: 25,
                images: [{ url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Royal Canin Dog Food' }],
                availableFor: ['Dog'],
                size: 'M',
                weight: '15 kg',
                ageGroup: 'Adult',
                features: ['High-quality protein', 'Supports digestion', 'Maintains ideal weight', 'Veterinarian recommended'],
                ingredients: ['Chicken', 'Rice', 'Corn', 'Wheat', 'Chicken Fat', 'Vitamins', 'Minerals'],
                nutritionalInfo: { protein: '26%', fat: '12%', fiber: '3.5%', moisture: '10%' },
                rating: 4.8,
                reviewCount: 156,
                isFeatured: true,
                isOnSale: true,
                veterinarianRecommended: true,
                popularityScore: 95
            },
            {
                name: 'Premium Cat Treats - Salmon Flavor',
                description: 'Irresistible salmon-flavored treats that cats love. Made with real salmon and natural ingredients. Perfect for training and bonding.',
                category: 'Food & Treats',
                brand: 'Whiskas',
                price: 549.00, // ~Rs 550 (was $12.99)
                stock: 40,
                images: [{ url: 'https://images.unsplash.com/photo-1516139008210-96e45dccd83b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Cat Treats' }],
                availableFor: ['Cat'],
                weight: '100g',
                ageGroup: 'All Ages',
                features: ['Real salmon', 'Natural ingredients', 'Great for training', 'Resealable package'],
                ingredients: ['Salmon', 'Chicken Meal', 'Rice', 'Taurine', 'Vitamins'],
                rating: 4.6,
                reviewCount: 89,
                popularityScore: 78
            },

            // Toys & Entertainment
            {
                name: 'Interactive Puzzle Ball',
                description: 'Engaging puzzle toy that challenges your dog mentally and physically. Dispenses treats as they play, keeping them entertained for hours.',
                category: 'Toys & Entertainment',
                brand: 'Kong',
                price: 1099.00, // ~Rs 1,100 (was $24.99)
                originalPrice: 1299.00, // ~Rs 1,300 (was $29.99)
                stock: 18,
                images: [{ url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Interactive Dog Toy' }],
                availableFor: ['Dog'],
                size: 'M',
                ageGroup: 'Adult',
                features: ['Mental stimulation', 'Treat dispensing', 'Durable construction', 'Easy to clean'],
                colors: ['Red', 'Blue', 'Green'],
                dimensions: { length: '10cm', width: '10cm', height: '10cm' },
                rating: 4.7,
                reviewCount: 124,
                isOnSale: true,
                isFeatured: true,
                popularityScore: 87
            },
            {
                name: 'Feather Wand Cat Toy',
                description: 'Classic feather wand that triggers your cat\'s natural hunting instincts. Hours of interactive play that strengthens the bond between you and your cat.',
                category: 'Toys & Entertainment',
                brand: 'Pet Zone',
                price: 399.00, // ~Rs 400 (was $8.99)
                stock: 35,
                images: [{ url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Cat Feather Toy' }],
                availableFor: ['Cat'],
                ageGroup: 'All Ages',
                features: ['Natural feathers', 'Extends to 3 feet', 'Triggers hunting instincts', 'Interactive play'],
                colors: ['Natural'],
                rating: 4.4,
                reviewCount: 67,
                popularityScore: 72
            },

            // Health & Wellness
            {
                name: 'Multivitamin Supplements for Dogs',
                description: 'Complete multivitamin formula to support your dog\'s overall health. Contains essential vitamins, minerals, and antioxidants for optimal wellness.',
                category: 'Health & Wellness',
                brand: 'Nutri-Vet',
                price: 1549.00, // ~Rs 1,550 (was $34.99)
                stock: 22,
                images: [{ url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Dog Vitamins' }],
                availableFor: ['Dog'],
                weight: '90 tablets',
                ageGroup: 'Adult',
                features: ['Complete nutrition', '90-day supply', 'Vet formulated', 'Easy to administer'],
                ingredients: ['Vitamin A', 'Vitamin C', 'Vitamin E', 'Calcium', 'Omega-3', 'Glucosamine'],
                rating: 4.5,
                reviewCount: 93,
                veterinarianRecommended: true,
                popularityScore: 68
            },

            // Grooming & Hygiene
            {
                name: 'Professional Pet Shampoo',
                description: 'Gentle, pH-balanced shampoo suitable for all coat types. Leaves fur soft, shiny, and smelling fresh. Free from harsh chemicals.',
                category: 'Grooming & Hygiene',
                brand: 'Pet Head',
                price: 749.00, // ~Rs 750 (was $16.99)
                stock: 28,
                images: [{ url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Pet Shampoo' }],
                availableFor: ['Dog', 'Cat'],
                weight: '500ml',
                ageGroup: 'All Ages',
                features: ['pH balanced', 'All natural', 'Pleasant scent', 'Suitable for sensitive skin'],
                ingredients: ['Aloe Vera', 'Coconut Oil', 'Vitamin E', 'Natural Fragrances'],
                colors: ['Clear'],
                rating: 4.3,
                reviewCount: 51,
                popularityScore: 61
            },

            // Beds & Furniture
            {
                name: 'Luxury Memory Foam Pet Bed',
                description: 'Premium memory foam bed that contours to your pet\'s body for ultimate comfort. Removable, washable cover with non-slip bottom.',
                category: 'Beds & Furniture',
                brand: 'PetSafe',
                price: 3999.00, // ~Rs 4,000 (was $89.99)
                originalPrice: 4899.00, // ~Rs 4,900 (was $109.99)
                stock: 12,
                images: [{ url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Pet Bed' }],
                availableFor: ['Dog', 'Cat'],
                size: 'L',
                ageGroup: 'Senior',
                features: ['Memory foam support', 'Washable cover', 'Non-slip bottom', 'Orthopedic design'],
                colors: ['Brown', 'Gray', 'Blue'],
                dimensions: { length: '75cm', width: '50cm', height: '10cm' },
                rating: 4.8,
                reviewCount: 78,
                isOnSale: true,
                veterinarianRecommended: true,
                popularityScore: 84
            },

            // Collars & Leashes
            {
                name: 'Adjustable Nylon Dog Collar',
                description: 'Durable, comfortable nylon collar with quick-release buckle. Reflective stitching for nighttime visibility. Available in multiple sizes and colors.',
                category: 'Collars & Leashes',
                brand: 'Ruffwear',
                price: 899.00, // ~Rs 900 (was $19.99)
                stock: 45,
                images: [{ url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Dog Collar' }],
                availableFor: ['Dog'],
                size: 'M',
                ageGroup: 'All Ages',
                features: ['Quick-release buckle', 'Reflective stitching', 'Comfortable padding', 'Adjustable fit'],
                colors: ['Red', 'Blue', 'Black', 'Pink', 'Green'],
                rating: 4.6,
                reviewCount: 134,
                popularityScore: 76
            },

            // Carriers & Travel
            {
                name: 'Soft-Sided Pet Carrier',
                description: 'Airline-approved pet carrier with mesh ventilation panels. Comfortable for your pet and convenient for travel. Includes shoulder strap.',
                category: 'Carriers & Travel',
                brand: 'Sherpa',
                price: 3149.00, // ~Rs 3,150 (was $69.99)
                stock: 15,
                images: [{ url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Pet Carrier' }],
                availableFor: ['Cat', 'Dog'],
                size: 'M',
                ageGroup: 'All Ages',
                features: ['Airline approved', 'Mesh ventilation', 'Shoulder strap', 'Machine washable'],
                colors: ['Black', 'Navy'],
                dimensions: { length: '43cm', width: '28cm', height: '28cm' },
                rating: 4.4,
                reviewCount: 87,
                popularityScore: 65
            },

            // Training & Behavior
            {
                name: 'Training Clicker Set',
                description: 'Professional dog training clicker with consistent sound. Includes wrist strap and training guide. Perfect for positive reinforcement training.',
                category: 'Training & Behavior',
                brand: 'StarMark',
                price: 349.00, // ~Rs 350 (was $7.99)
                stock: 60,
                images: [{ url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Training Clicker' }],
                availableFor: ['Dog'],
                ageGroup: 'All Ages',
                features: ['Consistent sound', 'Ergonomic design', 'Includes guide', 'Wrist strap included'],
                colors: ['Blue', 'Red'],
                rating: 4.7,
                reviewCount: 189,
                popularityScore: 81
            },

            // Aquarium & Fish Care
            {
                name: 'Premium Fish Flakes',
                description: 'Nutritionally complete flake food for tropical fish. Enhances color and promotes healthy growth. Easy to digest and reduces waste.',
                category: 'Aquarium & Fish Care',
                brand: 'Tetra',
                price: 649.00, // ~Rs 650 (was $14.99)
                stock: 30,
                images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Fish Food' }],
                availableFor: ['Fish'],
                weight: '200g',
                ageGroup: 'All Ages',
                features: ['Color enhancing', 'Easy digestion', 'Reduces waste', 'Complete nutrition'],
                ingredients: ['Fish Meal', 'Wheat Flour', 'Spirulina', 'Vitamins', 'Minerals'],
                rating: 4.2,
                reviewCount: 43,
                popularityScore: 52
            },

            // Bird Supplies
            {
                name: 'Seed Mix for Parrots',
                description: 'Premium seed mix specially formulated for parrots and large birds. Contains sunflower seeds, nuts, and dried fruits for balanced nutrition.',
                category: 'Bird Supplies',
                brand: 'Kaytee',
                price: 999.00, // ~Rs 1,000 (was $22.99)
                stock: 20,
                images: [{ url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Bird Seed' }],
                availableFor: ['Bird'],
                weight: '1.5 kg',
                ageGroup: 'Adult',
                features: ['Premium seeds', 'Added vitamins', 'No artificial colors', 'Resealable bag'],
                ingredients: ['Sunflower Seeds', 'Peanuts', 'Dried Fruits', 'Vitamins', 'Minerals'],
                rating: 4.5,
                reviewCount: 67,
                popularityScore: 58
            },

            // Small Animal Care
            {
                name: 'Rabbit Pellets - Timothy Hay Based',
                description: 'High-fiber pellets made from timothy hay. Perfect for adult rabbits. Supports dental health and digestive wellness.',
                category: 'Small Animal Care',
                brand: 'Oxbow',
                price: 849.00, // ~Rs 850 (was $18.99)
                stock: 25,
                images: [{ url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', alt: 'Rabbit Food' }],
                availableFor: ['Rabbit'],
                weight: '2.25 kg',
                ageGroup: 'Adult',
                features: ['Timothy hay based', 'High fiber', 'Supports dental health', 'No added sugars'],
                ingredients: ['Timothy Hay', 'Soybean Hulls', 'Wheat Middlings', 'Vitamins'],
                nutritionalInfo: { protein: '14%', fat: '4%', fiber: '25%', moisture: '10%' },
                rating: 4.6,
                reviewCount: 92,
                veterinarianRecommended: true,
                popularityScore: 64
            }
        ];
        
        // Insert products
        for (const productData of products) {
            const product = new Product(productData);
            await product.save();
            console.log(`✅ Created product: ${product.name} - Rs ${product.price.toFixed(2)}`);
        }
        
        console.log(`\n🎉 Successfully created ${products.length} products with MUR pricing!`);
        console.log('\nProduct categories created:');
        
        const categories = [...new Set(products.map(p => p.category))];
        categories.forEach(category => {
            const count = products.filter(p => p.category === category).length;
            console.log(`  • ${category}: ${count} products`);
        });
        
        console.log('\nFeatured products:');
        const featured = products.filter(p => p.isFeatured);
        featured.forEach(product => {
            console.log(`  ⭐ ${product.name} - Rs ${product.price.toFixed(2)}`);
        });
        
        console.log('\nSale products:');
        const onSale = products.filter(p => p.isOnSale);
        onSale.forEach(product => {
            const discountPercentage = product.originalPrice ? 
                Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
            console.log(`  🏷️ ${product.name} - ${discountPercentage}% off (Rs ${product.price.toFixed(2)})`);
        });
        
        console.log('\n💰 Price Range Summary:');
        const prices = products.map(p => p.price).sort((a, b) => a - b);
        console.log(`   Lowest: Rs ${prices[0].toFixed(2)}`);
        console.log(`   Highest: Rs ${prices[prices.length - 1].toFixed(2)}`);
        console.log(`   Average: Rs ${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error creating products:', error);
        process.exit(1);
    }
}

createProductsMUR(); 
