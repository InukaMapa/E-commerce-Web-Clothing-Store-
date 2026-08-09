require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

async function updateNomad() {
    await connectDB();
    
    const result = await Product.updateOne(
        { name: { $regex: /nomad/i } },
        { $set: { images: ["/images/nomad_cargo.png"] } }
    );
    
    console.log("Update result:", result);
    
    process.exit(0);
}

updateNomad();
