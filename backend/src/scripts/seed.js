const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Product = require("../models/Product");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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

    // 3. Sample Products
    const products = [
      {
        name: "Midnight Essential Hoodie",
        description: "A premium, heavyweight hoodie designed for ultimate comfort and a sleek, minimalist silhouette. Features a brushed interior for warmth.",
        price: 85.00,
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"],
        category: "Outerwear",
        variants: [
          { size: "S", color: "Midnight", stock: 15, sku: "HOOD-MID-S" },
          { size: "M", color: "Midnight", stock: 20, sku: "HOOD-MID-M" },
          { size: "L", color: "Midnight", stock: 5, sku: "HOOD-MID-L" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Nomad Cargo Pants",
        description: "Technically advanced cargo pants with water-resistant finish and ergonomic pockets. Perfect for urban exploration.",
        price: 120.00,
        images: ["https://images.unsplash.com/photo-1594931934402-621438517e27?q=80&w=800&auto=format&fit=crop"],
        category: "Bottoms",
        variants: [
          { size: "30", color: "Olive", stock: 10, sku: "PANT-OLV-30" },
          { size: "32", color: "Olive", stock: 12, sku: "PANT-OLV-32" },
          { size: "34", color: "Olive", stock: 8, sku: "PANT-OLV-34" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Classic Slate Tee",
        description: "The perfect everyday tee. Made from 100% organic cotton with a refined fit that stays sharp wash after wash.",
        price: 35.00,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"],
        category: "T-Shirts",
        variants: [
          { size: "S", color: "Slate", stock: 50, sku: "TEE-SLT-S" },
          { size: "M", color: "Slate", stock: 45, sku: "TEE-SLT-M" },
          { size: "L", color: "Slate", stock: 40, sku: "TEE-SLT-L" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Arctic Puffer Jacket",
        description: "Zero-compromise warmth. Our most insulated jacket, featuring ethically sourced down and a windproof shell.",
        price: 250.00,
        images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop"],
        category: "Outerwear",
        variants: [
          { size: "S", color: "Black", stock: 4, sku: "JKL-BLK-S" },
          { size: "M", color: "Black", stock: 6, sku: "JKL-BLK-M" },
          { size: "L", color: "Black", stock: 3, sku: "JKL-BLK-L" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Raw Denim Selvedge",
        description: "Traditional selvedge denim that breaks in over time to create a unique fade personal to your lifestyle.",
        price: 145.00,
        images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop"],
        category: "Bottoms",
        variants: [
          { size: "32", color: "Indigo", stock: 15, sku: "DEN-IND-32" },
          { size: "34", color: "Indigo", stock: 15, sku: "DEN-IND-34" },
        ],
        createdBy: admin._id,
      },
      {
        name: "Shadow Cap",
        description: "Minimalist 6-panel cap with signature embroidery. Adjustable strap for a custom fit.",
        price: 30.00,
        images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop"],
        category: "Accessories",
        variants: [
          { size: "OS", color: "Black", stock: 100, sku: "ACC-CAP-BLK" },
        ],
        createdBy: admin._id,
      }
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
