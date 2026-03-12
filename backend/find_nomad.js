require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

async function findNomad() {
    await connectDB();
    const products = await Product.find({ name: { $regex: /nomad/i } });
    
    fs.writeFileSync('nomad_output.json', JSON.stringify(products, null, 2));
    
    process.exit(0);
}

findNomad();
