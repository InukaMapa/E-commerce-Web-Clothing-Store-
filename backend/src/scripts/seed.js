const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Product = require("../models/Product");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Create Admin User
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = await User.create({
        name: "Admin User",
        email: "admin@slaughter.com",
        password: hashedPassword,
        role: "admin",
      });
    }

    // 1b. Create Producer User
    let producer = await User.findOne({ role: "producer" });
    if (!producer) {
      console.log("Creating producer user...");
      const hashedPassword = await bcrypt.hash("producer123", 10);
      producer = await User.create({
        name: "Alpha Producer",
        email: "producer@slaughter.com",
        password: hashedPassword,
        role: "producer",
      });
    }

    // 2. Clear existing products (Optional - keep it for clean state)
    await Product.deleteMany({});
    console.log("Existing products cleared.");

    // 3. Sample Products — Only standard categories: T-Shirt, Shirt, Jeans, Skirt, Frock
    const products = [
      {
        name: "Classic Slate Tee",
        description: "The perfect everyday tee. Made from 100% organic cotton with a refined fit that stays sharp wash after wash.",
        price: 35.00,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"],
        category: "T-Shirt",
        variants: [
          { size: "S", color: "Slate", stock: 50, sku: "TEE-SLT-S" },
          { size: "M", color: "Slate", stock: 45, sku: "TEE-SLT-M" },
          { size: "L", color: "Slate", stock: 40, sku: "TEE-SLT-L" },
          { size: "XL", color: "Slate", stock: 30, sku: "TEE-SLT-XL" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Urban Graphic Tee",
        description: "Bold graphic print on premium cotton. A statement piece that elevates any casual look.",
        price: 42.00,
        images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop"],
        category: "T-Shirt",
        variants: [
          { size: "S", color: "Black", stock: 25, sku: "TEE-GFX-S" },
          { size: "M", color: "Black", stock: 30, sku: "TEE-GFX-M" },
          { size: "L", color: "Black", stock: 20, sku: "TEE-GFX-L" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Oxford Button-Down Shirt",
        description: "A timeless Oxford cloth shirt with a classic button-down collar. Versatile enough for office or weekend wear.",
        price: 75.00,
        images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop"],
        category: "Shirt",
        variants: [
          { size: "S", color: "White", stock: 20, sku: "SHT-OXF-S-WHT" },
          { size: "M", color: "White", stock: 25, sku: "SHT-OXF-M-WHT" },
          { size: "L", color: "White", stock: 15, sku: "SHT-OXF-L-WHT" },
          { size: "M", color: "Blue", stock: 18, sku: "SHT-OXF-M-BLU" },
          { size: "L", color: "Blue", stock: 12, sku: "SHT-OXF-L-BLU" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Linen Summer Shirt",
        description: "Lightweight and breathable linen shirt, perfect for warm weather. Relaxed fit with a subtle texture.",
        price: 65.00,
        images: ["https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=800&auto=format&fit=crop"],
        category: "Shirt",
        variants: [
          { size: "S", color: "Beige", stock: 15, sku: "SHT-LNN-S" },
          { size: "M", color: "Beige", stock: 20, sku: "SHT-LNN-M" },
          { size: "L", color: "Beige", stock: 10, sku: "SHT-LNN-L" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Raw Denim Selvedge Jeans",
        description: "Traditional selvedge denim that breaks in over time to create a unique fade personal to your lifestyle.",
        price: 145.00,
        images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop"],
        category: "Jeans",
        variants: [
          { size: "30", color: "Indigo", stock: 15, sku: "JNS-IND-30" },
          { size: "32", color: "Indigo", stock: 15, sku: "JNS-IND-32" },
          { size: "34", color: "Indigo", stock: 10, sku: "JNS-IND-34" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Slim Fit Black Jeans",
        description: "Sharp, slim-fit jeans in classic black. A wardrobe essential that pairs with everything.",
        price: 95.00,
        images: ["https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=800&auto=format&fit=crop"],
        category: "Jeans",
        variants: [
          { size: "30", color: "Black", stock: 20, sku: "JNS-BLK-30" },
          { size: "32", color: "Black", stock: 22, sku: "JNS-BLK-32" },
          { size: "34", color: "Black", stock: 18, sku: "JNS-BLK-34" },
          { size: "36", color: "Black", stock: 8, sku: "JNS-BLK-36" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Floral Midi Skirt",
        description: "Elegant floral print midi skirt crafted from flowy chiffon. Perfect for garden parties and summer outings.",
        price: 58.00,
        images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop"],
        category: "Skirt",
        variants: [
          { size: "XS", color: "Rose", stock: 12, sku: "SKT-FLR-XS" },
          { size: "S", color: "Rose", stock: 18, sku: "SKT-FLR-S" },
          { size: "M", color: "Rose", stock: 15, sku: "SKT-FLR-M" },
          { size: "L", color: "Rose", stock: 8, sku: "SKT-FLR-L" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Pleated Satin Skirt",
        description: "Luxuriously smooth pleated satin skirt with a high waist cut. Effortlessly transitions from day to evening.",
        price: 72.00,
        images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop"],
        category: "Skirt",
        variants: [
          { size: "XS", color: "Black", stock: 10, sku: "SKT-SAT-XS" },
          { size: "S", color: "Black", stock: 14, sku: "SKT-SAT-S" },
          { size: "M", color: "Black", stock: 12, sku: "SKT-SAT-M" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Floral Wrap Frock",
        description: "A beautiful floral wrap-style frock with a flattering silhouette. Made from lightweight, breathable fabric.",
        price: 89.00,
        images: ["https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800&auto=format&fit=crop"],
        category: "Frock",
        variants: [
          { size: "XS", color: "Floral", stock: 10, sku: "FRK-WRP-XS" },
          { size: "S", color: "Floral", stock: 15, sku: "FRK-WRP-S" },
          { size: "M", color: "Floral", stock: 12, sku: "FRK-WRP-M" },
          { size: "L", color: "Floral", stock: 8, sku: "FRK-WRP-L" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Classic Black Frock",
        description: "A timeless little black dress with a clean, structured design. Perfect for any occasion.",
        price: 110.00,
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop"],
        category: "Frock",
        variants: [
          { size: "XS", color: "Black", stock: 8, sku: "FRK-BLK-XS" },
          { size: "S", color: "Black", stock: 12, sku: "FRK-BLK-S" },
          { size: "M", color: "Black", stock: 10, sku: "FRK-BLK-M" },
          { size: "L", color: "Black", stock: 6, sku: "FRK-BLK-L" },
        ],
        createdBy: admin._id,
      },
    ];

    await Product.insertMany(products);
    console.log(`${products.length} products seeded successfully!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
