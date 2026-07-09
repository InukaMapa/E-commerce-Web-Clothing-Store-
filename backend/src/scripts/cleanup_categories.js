const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");

// Only these 5 categories are allowed
const ALLOWED_CATEGORIES = ["T-Shirt", "Shirt", "Jeans", "Skirt", "Frock"];

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for category cleanup...");

    // Find all products NOT in the allowed categories (case-insensitive)
    const toDelete = await Product.find({
      category: {
        $nin: ALLOWED_CATEGORIES,
        // Also catch variants like "T-Shirts", "Frocks", "Outerwear", "Bottoms", "Accessories", "Shoes", etc.
      },
    });

    if (toDelete.length === 0) {
      console.log("✅ No products to delete — database is already clean.");
    } else {
      console.log(`Found ${toDelete.length} product(s) outside allowed categories:`);
      toDelete.forEach((p) =>
        console.log(`  - [${p.category}] ${p.name} (${p._id})`)
      );

      const result = await Product.deleteMany({
        category: { $nin: ALLOWED_CATEGORIES },
      });

      console.log(`\n🗑️  Permanently deleted ${result.deletedCount} product(s).`);
    }

    // Also normalise any "Frocks" -> "Frock" and "T-Shirts" -> "T-Shirt" that may exist
    const frocks = await Product.updateMany(
      { category: "Frocks" },
      { $set: { category: "Frock" } }
    );
    if (frocks.modifiedCount > 0)
      console.log(`✏️  Renamed ${frocks.modifiedCount} "Frocks" → "Frock"`);

    const tshirts = await Product.updateMany(
      { category: "T-Shirts" },
      { $set: { category: "T-Shirt" } }
    );
    if (tshirts.modifiedCount > 0)
      console.log(`✏️  Renamed ${tshirts.modifiedCount} "T-Shirts" → "T-Shirt"`);

    console.log("\n✅ Cleanup complete. Remaining categories: T-Shirt, Shirt, Jeans, Skirt, Frock");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
};

cleanup();
