/**
 * Comprehensive Product Seeder — All 5 Categories
 * Seeds products using actual uploaded images from /uploads/products/
 * Prices are in Sri Lankan Rupees (LKR)
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const User = require("../models/User");
const Product = require("../models/Product");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Get or create admin user
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

    console.log("Clearing existing products...");
    await Product.deleteMany({});

    const products = [
      // ─────────────────────────────────────────────────────────
      // T-SHIRTS — MEN
      // ─────────────────────────────────────────────────────────
      {
        name: "Reheat Periodic Elements Graphic Tee",
        description:
          "A standout graphic tee featuring a creative periodic table element design. Made from 100% premium cotton with a relaxed, comfortable fit. Perfect for casual outings and streetwear looks. Pre-shrunk fabric ensures the fit stays true after multiple washes.",
        price: 1850,
        images: [
          "/uploads/products/product-1781809038756-294047265.png",
          "/uploads/products/product-1781809042713-216702720.png",
          "/uploads/products/product-1781809046238-949950285.png",
        ],
        category: "T-Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "White", stock: 30, sku: "TSH-RHT-WHT-S" },
          { size: "M", color: "White", stock: 40, sku: "TSH-RHT-WHT-M" },
          { size: "L", color: "White", stock: 35, sku: "TSH-RHT-WHT-L" },
          { size: "XL", color: "White", stock: 20, sku: "TSH-RHT-WHT-XL" },
          { size: "2XL", color: "White", stock: 15, sku: "TSH-RHT-WHT-2XL" },
        ],
        tags: ["graphic tee", "cotton", "casual", "men"],
      },
      {
        name: "Classic Eagle Emblem Tee — Teal",
        description:
          "A timeless crew-neck tee featuring a subtle eagle emblem embroidery on the chest. Crafted from premium piqué cotton for a smooth, structured feel. The rich teal colour adds a sophisticated touch to casual dressing. Ideal for everyday wear or pairing with chinos.",
        price: 1650,
        images: [
          "/uploads/products/product-1781810646574-171040774.png",
          "/uploads/products/product-1781810650207-963084086.png",
          "/uploads/products/product-1781810654421-128245233.png",
        ],
        category: "T-Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "Teal", stock: 25, sku: "TSH-EGL-TEL-S" },
          { size: "M", color: "Teal", stock: 35, sku: "TSH-EGL-TEL-M" },
          { size: "L", color: "Teal", stock: 30, sku: "TSH-EGL-TEL-L" },
          { size: "XL", color: "Teal", stock: 18, sku: "TSH-EGL-TEL-XL" },
        ],
        tags: ["classic", "cotton", "emblem", "men"],
      },
      {
        name: "Ice Blue Classic Polo Shirt",
        description:
          "An essential polo shirt in a refreshing ice blue tone. Constructed from soft piqué cotton with a two-button placket and ribbed collar. The subtle logo badge on the chest adds a premium brand touch. Pairs effortlessly with casual trousers or shorts — perfect for the Sri Lankan climate.",
        price: 2200,
        images: [
          "/uploads/products/product-1781811288238-712724295.png",
          "/uploads/products/product-1781811297229-227574944.png",
          "/uploads/products/product-1781811350018-136512242.png",
        ],
        category: "T-Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "Ice Blue", stock: 20, sku: "TSH-PLO-ICB-S" },
          { size: "M", color: "Ice Blue", stock: 30, sku: "TSH-PLO-ICB-M" },
          { size: "L", color: "Ice Blue", stock: 25, sku: "TSH-PLO-ICB-L" },
          { size: "XL", color: "Ice Blue", stock: 12, sku: "TSH-PLO-ICB-XL" },
        ],
        tags: ["polo", "casual", "classic", "men"],
      },
      {
        name: "White Zip-Collar Premium Polo",
        description:
          "A sophisticated quarter-zip polo shirt in crisp white. Features a slim polo collar with a front zipper for a modern, athletic aesthetic. Made from moisture-wicking, breathable fabric — ideal for warm tropical weather. Can be worn to the gym, casual outings, or sports events.",
        price: 2550,
        images: [
          "/uploads/products/product-1781811476316-301859423.png",
          "/uploads/products/product-1781811481951-18121563.png",
          "/uploads/products/product-1781811487919-306091908.png",
        ],
        category: "T-Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "White", stock: 20, sku: "TSH-ZPO-WHT-S" },
          { size: "M", color: "White", stock: 28, sku: "TSH-ZPO-WHT-M" },
          { size: "L", color: "White", stock: 22, sku: "TSH-ZPO-WHT-L" },
          { size: "XL", color: "White", stock: 15, sku: "TSH-ZPO-WHT-XL" },
        ],
        tags: ["polo", "zip", "athletic", "men"],
      },
      {
        name: "Beige Striped Knit Tee",
        description:
          "A fashion-forward knit tee with bold vertical white stripes on a warm beige base. The structured knit fabric gives a premium, textured look while remaining breathable. A great choice for those who want to elevate their casual wardrobe. Pairs perfectly with black trousers or chinos.",
        price: 2900,
        images: [
          "/uploads/products/product-1781811685818-990793075.png",
          "/uploads/products/product-1781811692487-293243524.png",
        ],
        category: "T-Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "Beige", stock: 15, sku: "TSH-KNT-BEG-S" },
          { size: "M", color: "Beige", stock: 22, sku: "TSH-KNT-BEG-M" },
          { size: "L", color: "Beige", stock: 18, sku: "TSH-KNT-BEG-L" },
          { size: "XL", color: "Beige", stock: 10, sku: "TSH-KNT-BEG-XL" },
        ],
        tags: ["knit", "striped", "premium", "men"],
      },
      {
        name: "Black Bold Stripe Knit Tee",
        description:
          "A striking black-and-white vertical striped knit tee that commands attention. Made from high-quality cotton-blend knit that drapes beautifully. The slim-fit silhouette accentuates the body without being restrictive. A versatile staple for any modern man's wardrobe.",
        price: 2900,
        images: [
          "/uploads/products/product-1782074965837-202277078.png",
          "/uploads/products/product-1782074975175-766312321.png",
        ],
        category: "T-Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "Black", stock: 18, sku: "TSH-KNT-BLK-S" },
          { size: "M", color: "Black", stock: 25, sku: "TSH-KNT-BLK-M" },
          { size: "L", color: "Black", stock: 20, sku: "TSH-KNT-BLK-L" },
          { size: "XL", color: "Black", stock: 12, sku: "TSH-KNT-BLK-XL" },
        ],
        tags: ["knit", "striped", "bold", "men"],
      },
      {
        name: "Grey Zip-Collar Polo — Muscle Fit",
        description:
          "A muscle-fit polo in slate grey with a modern zip collar design. Built from performance-grade polyester-cotton blend that holds its shape during active use. The tailored cut flatters an athletic physique. Great for gym sessions, casual meetups, or weekends.",
        price: 2450,
        images: [
          "/uploads/products/product-1782075361131-726545728.png",
          "/uploads/products/product-1782075367256-248210461.png",
        ],
        category: "T-Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "Grey", stock: 16, sku: "TSH-ZPO-GRY-S" },
          { size: "M", color: "Grey", stock: 24, sku: "TSH-ZPO-GRY-M" },
          { size: "L", color: "Grey", stock: 20, sku: "TSH-ZPO-GRY-L" },
          { size: "XL", color: "Grey", stock: 12, sku: "TSH-ZPO-GRY-XL" },
        ],
        tags: ["polo", "zip", "muscle fit", "men"],
      },
      {
        name: "Mimi Raglan V-Neck Tee — Women",
        description:
          "A trendy women's raglan-sleeve V-neck tee with a bold 'MIMI' graphic lettering. The black contrast sleeves against the white body create a sporty, youthful look. Made from soft, lightweight cotton that keeps you cool and comfortable all day.",
        price: 1750,
        images: [
          "/uploads/products/product-1782062086075-584509249.webp",
        ],
        category: "T-Shirt",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "White/Black", stock: 15, sku: "TSH-MMI-WBK-XS" },
          { size: "S", color: "White/Black", stock: 22, sku: "TSH-MMI-WBK-S" },
          { size: "M", color: "White/Black", stock: 20, sku: "TSH-MMI-WBK-M" },
          { size: "L", color: "White/Black", stock: 12, sku: "TSH-MMI-WBK-L" },
        ],
        tags: ["graphic", "raglan", "women", "casual"],
      },
      // ─────────────────────────────────────────────────────────
      // T-SHIRTS — UNISEX OVERSIZED
      // ─────────────────────────────────────────────────────────
      {
        name: "Oversized Black Essential Tee — Unisex",
        description:
          "The ultimate wardrobe staple — an oversized unisex tee in jet black. Made from heavyweight 240 GSM cotton for a premium, structured drop. The boxy fit is versatile for both men and women. Perfect for layering or wearing solo with wide-leg pants or shorts.",
        price: 2100,
        images: [
          "/uploads/products/product-1782407607103-195927387.png",
          "/uploads/products/product-1782407612797-140948556.png",
          "/uploads/products/product-1782407617952-9760270.png",
        ],
        category: "T-Shirt",
        gender: "unisex",
        status: "approved",
        variants: [
          { size: "XS", color: "Black", stock: 20, sku: "TSH-OVR-BLK-XS" },
          { size: "S", color: "Black", stock: 35, sku: "TSH-OVR-BLK-S" },
          { size: "M", color: "Black", stock: 40, sku: "TSH-OVR-BLK-M" },
          { size: "L", color: "Black", stock: 30, sku: "TSH-OVR-BLK-L" },
          { size: "XL", color: "Black", stock: 20, sku: "TSH-OVR-BLK-XL" },
          { size: "2XL", color: "Black", stock: 15, sku: "TSH-OVR-BLK-2XL" },
        ],
        tags: ["oversized", "unisex", "essential", "heavyweight"],
      },
      {
        name: "Club 1989 Graphic Tee — Charcoal",
        description:
          "A bold graphic oversized tee featuring the iconic 'Club 1989' ornate print on the back. The charcoal wash and detailed artwork create a vintage, collector-piece aesthetic. Made from 100% cotton with a boxy unisex fit. A statement piece for streetwear enthusiasts.",
        price: 2800,
        images: [
          "/uploads/products/product-1782407763379-295553497.png",
          "/uploads/products/product-1782407769044-136653473.png",
          "/uploads/products/product-1782407774754-571473119.png",
        ],
        category: "T-Shirt",
        gender: "unisex",
        status: "approved",
        variants: [
          { size: "S", color: "Charcoal", stock: 25, sku: "TSH-C89-CHR-S" },
          { size: "M", color: "Charcoal", stock: 30, sku: "TSH-C89-CHR-M" },
          { size: "L", color: "Charcoal", stock: 25, sku: "TSH-C89-CHR-L" },
          { size: "XL", color: "Charcoal", stock: 15, sku: "TSH-C89-CHR-XL" },
        ],
        tags: ["graphic", "oversized", "streetwear", "unisex"],
      },
      {
        name: "Oversized Pink Essential Tee — Unisex",
        description:
          "A soft pastel pink oversized tee that brings playful charm to casual dressing. Same heavyweight 240 GSM cotton as the black version. Ideal for those who love minimal, clean aesthetics with a pop of colour. Pairs beautifully with white or black bottoms.",
        price: 2100,
        images: [
          "/uploads/products/product-1782407839614-763118798.png",
          "/uploads/products/product-1782407844362-638252133.png",
          "/uploads/products/product-1782407849545-355506567.png",
        ],
        category: "T-Shirt",
        gender: "unisex",
        status: "approved",
        variants: [
          { size: "XS", color: "Pink", stock: 18, sku: "TSH-OVR-PNK-XS" },
          { size: "S", color: "Pink", stock: 28, sku: "TSH-OVR-PNK-S" },
          { size: "M", color: "Pink", stock: 32, sku: "TSH-OVR-PNK-M" },
          { size: "L", color: "Pink", stock: 22, sku: "TSH-OVR-PNK-L" },
          { size: "XL", color: "Pink", stock: 14, sku: "TSH-OVR-PNK-XL" },
        ],
        tags: ["oversized", "unisex", "pastel", "casual"],
      },
      {
        name: "Club 1989 Graphic Tee — Navy",
        description:
          "The iconic Club 1989 graphic print in a rich navy blue colourway. Features the ornate back-panel artwork and a subtle chest script. The deep navy tone gives a sophisticated yet streetwear-ready vibe. Perfect for those who want to stand out from the crowd.",
        price: 2800,
        images: [
          "/uploads/products/product-1782407926287-932566892.png",
          "/uploads/products/product-1782407932537-132195780.png",
          "/uploads/products/product-1782407937331-816602006.png",
          "/uploads/products/product-1782407943118-142145375.png",
        ],
        category: "T-Shirt",
        gender: "unisex",
        status: "approved",
        variants: [
          { size: "S", color: "Navy", stock: 22, sku: "TSH-C89-NVY-S" },
          { size: "M", color: "Navy", stock: 30, sku: "TSH-C89-NVY-M" },
          { size: "L", color: "Navy", stock: 25, sku: "TSH-C89-NVY-L" },
          { size: "XL", color: "Navy", stock: 12, sku: "TSH-C89-NVY-XL" },
        ],
        tags: ["graphic", "oversized", "streetwear", "unisex"],
      },
      // ─────────────────────────────────────────────────────────
      // SHIRTS — MEN
      // ─────────────────────────────────────────────────────────
      {
        name: "Charcoal Formal Long-Sleeve Shirt",
        description:
          "A timeless formal shirt in sophisticated charcoal grey. Made from premium poplin fabric with a crisp spread collar and single-button cuffs. The slim-fit cut keeps a clean, professional silhouette ideal for office wear, business meetings, or formal events. Easy-iron fabric for hassle-free maintenance.",
        price: 3800,
        images: [
          "/uploads/products/product-1781811953760-604375025.png",
          "/uploads/products/product-1781811958182-471023400.png",
          "/uploads/products/product-1781811962525-688031354.png",
        ],
        category: "Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "Charcoal", stock: 15, sku: "SHT-FRM-CHR-S" },
          { size: "M", color: "Charcoal", stock: 22, sku: "SHT-FRM-CHR-M" },
          { size: "L", color: "Charcoal", stock: 18, sku: "SHT-FRM-CHR-L" },
          { size: "XL", color: "Charcoal", stock: 10, sku: "SHT-FRM-CHR-XL" },
        ],
        tags: ["formal", "office", "slim-fit", "men"],
      },
      {
        name: "Sage Green Striped Short-Sleeve Shirt",
        description:
          "A relaxed short-sleeve shirt with bold vertical sage-green and white stripes. Made from breathable linen-cotton blend that keeps you cool in Sri Lanka's tropical climate. The wooden buttons and chest pocket add a casual, holiday-ready detail. Perfect for beach outings or weekend brunches.",
        price: 2950,
        images: [
          "/uploads/products/product-1781811004859-407136410.png",
          "/uploads/products/product-1781811039440-486391092.png",
          "/uploads/products/product-1781811045946-446108747.png",
        ],
        category: "Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "Sage Green", stock: 18, sku: "SHT-STR-SGG-S" },
          { size: "M", color: "Sage Green", stock: 25, sku: "SHT-STR-SGG-M" },
          { size: "L", color: "Sage Green", stock: 20, sku: "SHT-STR-SGG-L" },
          { size: "XL", color: "Sage Green", stock: 12, sku: "SHT-STR-SGG-XL" },
        ],
        tags: ["casual", "striped", "linen", "summer", "men"],
      },
      {
        name: "White Formal Dress Shirt — Diamond Buttons",
        description:
          "An elegant white formal dress shirt featuring distinctive diamond-shaped black buttons as a unique style detail. The structured, slim-fit cut gives a polished look for weddings, special occasions, or professional settings. Made from high-thread-count cotton blend with a smooth, wrinkle-resistant finish.",
        price: 4200,
        images: [
          "/uploads/products/product-1782075496835-912202053.png",
          "/uploads/products/product-1782075504424-621429358.png",
        ],
        category: "Shirt",
        gender: "men",
        status: "approved",
        variants: [
          { size: "S", color: "White", stock: 12, sku: "SHT-DRS-WHT-S" },
          { size: "M", color: "White", stock: 18, sku: "SHT-DRS-WHT-M" },
          { size: "L", color: "White", stock: 15, sku: "SHT-DRS-WHT-L" },
          { size: "XL", color: "White", stock: 8, sku: "SHT-DRS-WHT-XL" },
        ],
        tags: ["formal", "wedding", "dress shirt", "men"],
      },
      // ─────────────────────────────────────────────────────────
      // JEANS — WOMEN
      // ─────────────────────────────────────────────────────────
      {
        name: "Women's High-Waist Black Skinny Jeans",
        description:
          "A sleek, high-waisted skinny jean in deep black denim. The 2% elastane content provides an excellent stretch-to-recovery ratio, hugging your curves while keeping you comfortable all day. Five-pocket styling with a gold-tone button and zip fly. Pairs perfectly with crop tops, formal blouses, or oversized tees.",
        price: 4500,
        images: [
          "/uploads/products/product-1782327840794-190123609.webp",
          "/uploads/products/product-1782327849992-485889514.webp",
          "/uploads/products/product-1782327859456-761591858.webp",
        ],
        category: "Jeans",
        gender: "women",
        status: "approved",
        variants: [
          { size: "28", color: "Black", stock: 20, sku: "JNS-SKN-BLK-28" },
          { size: "30", color: "Black", stock: 25, sku: "JNS-SKN-BLK-30" },
          { size: "32", color: "Black", stock: 22, sku: "JNS-SKN-BLK-32" },
          { size: "34", color: "Black", stock: 15, sku: "JNS-SKN-BLK-34" },
        ],
        tags: ["skinny", "high-waist", "women", "denim"],
      },
      {
        name: "Women's High-Rise Wide-Leg Navy Jeans",
        description:
          "A fashion-forward wide-leg jean in a rich navy indigo wash. The high-rise waist elongates the legs and flatters the silhouette, while the wide leg gives a relaxed, 70s-inspired look. Made from premium stretch denim with a front zip and button closure. A true versatile piece for modern Sri Lankan fashion.",
        price: 5200,
        images: [
          "/uploads/products/product-1782379926481-974480657.webp",
          "/uploads/products/product-1782379533598-995537683.webp",
          "/uploads/products/product-1782379540501-795647680.webp",
        ],
        category: "Jeans",
        gender: "women",
        status: "approved",
        variants: [
          { size: "28", color: "Navy", stock: 18, sku: "JNS-WDL-NVY-28" },
          { size: "30", color: "Navy", stock: 22, sku: "JNS-WDL-NVY-30" },
          { size: "32", color: "Navy", stock: 18, sku: "JNS-WDL-NVY-32" },
          { size: "34", color: "Navy", stock: 10, sku: "JNS-WDL-NVY-34" },
        ],
        tags: ["wide-leg", "high-rise", "women", "navy"],
      },
      {
        name: "Women's Light Wash Wide-Leg Patch Pocket Jeans",
        description:
          "Effortlessly chic wide-leg jeans in a soft light blue wash with oversized patch pockets on the front. The clean, minimal design makes these jeans incredibly versatile. High-rise silhouette pairs beautifully with crop tops and fitted blouses. A wardrobe essential for the modern woman.",
        price: 5500,
        images: [
          "/uploads/products/product-1782326656320-444023362.webp",
          "/uploads/products/product-1782326663499-261818392.webp",
        ],
        category: "Jeans",
        gender: "women",
        status: "approved",
        variants: [
          { size: "28", color: "Light Blue", stock: 16, sku: "JNS-WDL-LBL-28" },
          { size: "30", color: "Light Blue", stock: 20, sku: "JNS-WDL-LBL-30" },
          { size: "32", color: "Light Blue", stock: 17, sku: "JNS-WDL-LBL-32" },
          { size: "34", color: "Light Blue", stock: 8, sku: "JNS-WDL-LBL-34" },
        ],
        tags: ["wide-leg", "patch pocket", "light wash", "women"],
      },
      {
        name: "Women's Mid-Wash Cargo Jogger Jeans",
        description:
          "A modern fusion of jogger comfort and cargo functionality in a mid-blue denim wash. Features utility cargo pockets on the sides and an elasticised cuffed hem. The relaxed-fit waist is flattering and comfortable. Perfect for a trendy, utilitarian-chic look for everyday wear.",
        price: 4800,
        images: [
          "/uploads/products/product-1782380384720-448425193.webp",
          "/uploads/products/product-1782379266968-414212519.webp",
          "/uploads/products/product-1782379274006-910119886.webp",
          "/uploads/products/product-1782379281466-285018896.webp",
        ],
        category: "Jeans",
        gender: "women",
        status: "approved",
        variants: [
          { size: "28", color: "Mid Blue", stock: 15, sku: "JNS-CGO-MBL-28" },
          { size: "30", color: "Mid Blue", stock: 20, sku: "JNS-CGO-MBL-30" },
          { size: "32", color: "Mid Blue", stock: 15, sku: "JNS-CGO-MBL-32" },
          { size: "34", color: "Mid Blue", stock: 8, sku: "JNS-CGO-MBL-34" },
        ],
        tags: ["cargo", "jogger", "women", "utility"],
      },
      {
        name: "Women's Mid-Wash Slim Ankle Jeans",
        description:
          "Classic slim-fit ankle-length jeans in a versatile mid-blue wash. The slightly cropped hem shows off your footwear choice — whether heels, sneakers, or sandals. Stretch denim provides comfortable all-day wear. A style essential that suits Sri Lankan women of all body types.",
        price: 4200,
        images: [
          "/uploads/products/product-1782380598150-577427712.webp",
          "/uploads/products/product-1782380268250-265856210.webp",
        ],
        category: "Jeans",
        gender: "women",
        status: "approved",
        variants: [
          { size: "28", color: "Mid Blue", stock: 20, sku: "JNS-SLM-MBL-28" },
          { size: "30", color: "Mid Blue", stock: 25, sku: "JNS-SLM-MBL-30" },
          { size: "32", color: "Mid Blue", stock: 20, sku: "JNS-SLM-MBL-32" },
          { size: "34", color: "Mid Blue", stock: 12, sku: "JNS-SLM-MBL-34" },
        ],
        tags: ["slim", "ankle", "women", "versatile"],
      },
      {
        name: "Women's Dark Green Wide-Leg Trousers",
        description:
          "Chic high-waist wide-leg trousers in an elegant dark forest green. Made from a smooth crepe-like fabric with a side zipper and clean waistband finish. The deep green creates a sophisticated yet relaxed look ideal for both office and evening outings. A versatile wardrobe statement piece.",
        price: 3900,
        images: [
          "/uploads/products/product-1782380900208-249537233.webp",
          "/uploads/products/product-1782380908460-631288279.webp",
        ],
        category: "Jeans",
        gender: "women",
        status: "approved",
        variants: [
          { size: "28", color: "Forest Green", stock: 14, sku: "JNS-WDL-FGR-28" },
          { size: "30", color: "Forest Green", stock: 18, sku: "JNS-WDL-FGR-30" },
          { size: "32", color: "Forest Green", stock: 14, sku: "JNS-WDL-FGR-32" },
          { size: "34", color: "Forest Green", stock: 8, sku: "JNS-WDL-FGR-34" },
        ],
        tags: ["wide-leg", "trousers", "women", "office"],
      },
      {
        name: "Women's Cuffed Denim Shorts",
        description:
          "Must-have mid-rise denim shorts with a rolled cuff hem for a classic casual look. Made from slightly stretchy mid-weight denim that moves with you. Five-pocket design with a zip fly. Perfect for Sri Lanka's warm weather — pair with crop tops, casual tees, or knotted shirts.",
        price: 3200,
        images: [
          "/uploads/products/product-1782381135287-635800271.webp",
          "/uploads/products/product-1782328091543-711693649.webp",
          "/uploads/products/product-1782328099482-655818799.webp",
          "/uploads/products/product-1782328106045-434605181.webp",
        ],
        category: "Jeans",
        gender: "women",
        status: "approved",
        variants: [
          { size: "28", color: "Light Blue", stock: 18, sku: "JNS-SHT-LBL-28" },
          { size: "30", color: "Light Blue", stock: 25, sku: "JNS-SHT-LBL-30" },
          { size: "32", color: "Light Blue", stock: 20, sku: "JNS-SHT-LBL-32" },
          { size: "34", color: "Light Blue", stock: 10, sku: "JNS-SHT-LBL-34" },
        ],
        tags: ["shorts", "denim", "casual", "women"],
      },
      // ─────────────────────────────────────────────────────────
      // SKIRTS — WOMEN
      // ─────────────────────────────────────────────────────────
      {
        name: "Dusty Pink Maxi Button-Front Skirt",
        description:
          "An elegant dusty pink maxi skirt with a full-length button placket from waist to hem. Made from a flowing woven fabric with a natural drape. The high waist and clean A-line silhouette create a feminine, modest look ideal for formal occasions, evening events, or religious gatherings in Sri Lanka.",
        price: 3500,
        images: [
          "/uploads/products/product-1782137852108-561145470.jpeg",
          "/uploads/products/product-1782137866143-438656656.jpeg",
        ],
        category: "Skirt",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Dusty Pink", stock: 12, sku: "SKT-MXI-DPK-XS" },
          { size: "S", color: "Dusty Pink", stock: 18, sku: "SKT-MXI-DPK-S" },
          { size: "M", color: "Dusty Pink", stock: 15, sku: "SKT-MXI-DPK-M" },
          { size: "L", color: "Dusty Pink", stock: 10, sku: "SKT-MXI-DPK-L" },
        ],
        tags: ["maxi", "button-front", "elegant", "women"],
      },
      {
        name: "White Flared Mini Skirt",
        description:
          "A fresh and flirty white flared mini skirt that's perfect for warm sunny days. Made from a smooth scuba-like fabric with an elasticised waistband for comfort. The flare adds movement and femininity. Pairs beautifully with crop tops, off-shoulder blouses, or casual tees for a carefree summer vibe.",
        price: 2800,
        images: [
          "/uploads/products/product-1782138956134-598689723.webp",
          "/uploads/products/product-1782138997155-776392601.webp",
          "/uploads/products/product-1782139003708-927677715.webp",
        ],
        category: "Skirt",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "White", stock: 14, sku: "SKT-MIN-WHT-XS" },
          { size: "S", color: "White", stock: 20, sku: "SKT-MIN-WHT-S" },
          { size: "M", color: "White", stock: 18, sku: "SKT-MIN-WHT-M" },
          { size: "L", color: "White", stock: 10, sku: "SKT-MIN-WHT-L" },
        ],
        tags: ["mini", "flared", "summer", "women"],
      },
      {
        name: "Baby Pink Satin Maxi Skirt",
        description:
          "A dreamy baby pink maxi skirt in luxurious satin fabric. The silk-like sheen creates an elevated, glamorous aesthetic perfect for evening parties, weddings, or night outings. Features a comfortable elasticised waistband and a smooth, flowing fall. A statement piece for special occasions.",
        price: 4200,
        images: [
          "/uploads/products/product-1782139371143-550446946.webp",
          "/uploads/products/product-1782139377128-829949106.webp",
          "/uploads/products/product-1782139383948-33955731.webp",
          "/uploads/products/product-1782139393203-832804685.webp",
          "/uploads/products/product-1782139400755-733199048.webp",
        ],
        category: "Skirt",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Baby Pink", stock: 10, sku: "SKT-STN-BPK-XS" },
          { size: "S", color: "Baby Pink", stock: 15, sku: "SKT-STN-BPK-S" },
          { size: "M", color: "Baby Pink", stock: 12, sku: "SKT-STN-BPK-M" },
          { size: "L", color: "Baby Pink", stock: 8, sku: "SKT-STN-BPK-L" },
        ],
        tags: ["satin", "maxi", "glamorous", "women"],
      },
      {
        name: "Beige Structural Midi Skirt — Halter Co-ord",
        description:
          "A sophisticated beige midi skirt with structural panelling and large patch pockets, designed as part of a halter co-ord set. The tailored fit and clean lines create a modern, editorial look. Ideal for fashion-forward women who appreciate minimalist design with an architectural edge.",
        price: 3800,
        images: [
          "/uploads/products/product-1782139642227-313943630.webp",
          "/uploads/products/product-1782139652237-725737691.webp",
          "/uploads/products/product-1782139659294-333161561.webp",
          "/uploads/products/product-1782139666159-569389044.webp",
        ],
        category: "Skirt",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Beige", stock: 12, sku: "SKT-STR-BEG-XS" },
          { size: "S", color: "Beige", stock: 16, sku: "SKT-STR-BEG-S" },
          { size: "M", color: "Beige", stock: 14, sku: "SKT-STR-BEG-M" },
          { size: "L", color: "Beige", stock: 8, sku: "SKT-STR-BEG-L" },
        ],
        tags: ["midi", "structural", "co-ord", "women"],
      },
      {
        name: "Purple Batik Print Tiered Midi Skirt",
        description:
          "A vibrant purple batik-print midi skirt with tiered ruffle detailing at the hem. Made from lightweight cotton fabric with an authentic hand-print batik pattern. The elasticised waist and breathable cotton construction make it comfortable for Sri Lanka's tropical weather. Perfect for cultural events, casual outings, or festive occasions.",
        price: 3200,
        images: [
          "/uploads/products/product-1782139897754-790832050.webp",
          "/uploads/products/product-1782139904991-3289146.webp",
          "/uploads/products/product-1782139914447-871479879.webp",
          "/uploads/products/product-1782139921036-46084026.webp",
        ],
        category: "Skirt",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Purple", stock: 14, sku: "SKT-BTK-PRP-XS" },
          { size: "S", color: "Purple", stock: 18, sku: "SKT-BTK-PRP-S" },
          { size: "M", color: "Purple", stock: 15, sku: "SKT-BTK-PRP-M" },
          { size: "L", color: "Purple", stock: 10, sku: "SKT-BTK-PRP-L" },
        ],
        tags: ["batik", "tiered", "print", "women"],
      },
      {
        name: "Crimson Red Satin Maxi Skirt",
        description:
          "A bold and breathtaking crimson red satin maxi skirt that exudes confidence. The silky-smooth satin fabric drapes beautifully, creating a luxurious, fluid look. Features a comfortable elasticised waistband. Perfect for parties, weddings, and evening events where you want to make a lasting impression.",
        price: 4200,
        images: [
          "/uploads/products/product-1782140399258-254759381.webp",
          "/uploads/products/product-1782140406219-947120752.webp",
          "/uploads/products/product-1782140415637-701668740.webp",
          "/uploads/products/product-1782140424468-825409600.webp",
        ],
        category: "Skirt",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Crimson Red", stock: 10, sku: "SKT-STN-RED-XS" },
          { size: "S", color: "Crimson Red", stock: 14, sku: "SKT-STN-RED-S" },
          { size: "M", color: "Crimson Red", stock: 12, sku: "SKT-STN-RED-M" },
          { size: "L", color: "Crimson Red", stock: 7, sku: "SKT-STN-RED-L" },
        ],
        tags: ["satin", "maxi", "red", "glamorous", "women"],
      },
      {
        name: "Mustard Yellow Pencil Skirt",
        description:
          "A classic pencil skirt in a warm mustard yellow that adds a pop of colour to office or event dressing. The body-skimming cut and knee-length hem create a polished, professional silhouette. Made from a structured ponte knit fabric with a back vent for ease of movement. A versatile piece that transitions from desk to dinner.",
        price: 3400,
        images: [
          "/uploads/products/product-1782141071194-145140204.webp",
          "/uploads/products/product-1782141082656-925117028.webp",
          "/uploads/products/product-1782141091437-332611515.webp",
        ],
        category: "Skirt",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Mustard Yellow", stock: 12, sku: "SKT-PCL-MST-XS" },
          { size: "S", color: "Mustard Yellow", stock: 16, sku: "SKT-PCL-MST-S" },
          { size: "M", color: "Mustard Yellow", stock: 14, sku: "SKT-PCL-MST-M" },
          { size: "L", color: "Mustard Yellow", stock: 8, sku: "SKT-PCL-MST-L" },
        ],
        tags: ["pencil", "office", "mustard", "women"],
      },
      // ─────────────────────────────────────────────────────────
      // FROCKS — WOMEN
      // ─────────────────────────────────────────────────────────
      {
        name: "Black Puff-Sleeve Shirt Midi Dress",
        description:
          "A dramatic and elegant black midi dress with puffed sleeves and a structured shirt-style bodice. The voluminous skirt creates a striking contrast with the fitted waist. Made from a high-quality cotton-poplin blend with beautiful tailoring. Perfect for cocktail parties, formal dinners, or any occasion demanding a strong fashion statement.",
        price: 6800,
        images: [
          "/uploads/products/product-1782071612818-681552676.jpeg",
          "/uploads/products/product-1782071620575-972136588.jpeg",
          "/uploads/products/product-1782071628124-934431401.jpeg",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Black", stock: 8, sku: "FRK-SHT-BLK-XS" },
          { size: "S", color: "Black", stock: 12, sku: "FRK-SHT-BLK-S" },
          { size: "M", color: "Black", stock: 10, sku: "FRK-SHT-BLK-M" },
          { size: "L", color: "Black", stock: 6, sku: "FRK-SHT-BLK-L" },
        ],
        tags: ["midi", "puff sleeve", "formal", "women"],
      },
      {
        name: "Ivory White V-Neck Buttoned Midi Dress",
        description:
          "A beautifully structured ivory white midi dress with a deep V-neckline and a row of delicate buttons down the bodice. The flared A-line skirt creates a romantic, bridal-inspired silhouette. Made from a lightweight, textured fabric perfect for formal occasions, engagement shoots, or weddings. Simple elegance at its finest.",
        price: 7200,
        images: [
          "/uploads/products/product-1782072131350-755309539.jpeg",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Ivory", stock: 7, sku: "FRK-MDI-IVR-XS" },
          { size: "S", color: "Ivory", stock: 10, sku: "FRK-MDI-IVR-S" },
          { size: "M", color: "Ivory", stock: 8, sku: "FRK-MDI-IVR-M" },
          { size: "L", color: "Ivory", stock: 5, sku: "FRK-MDI-IVR-L" },
        ],
        tags: ["midi", "V-neck", "bridal", "elegant", "women"],
      },
      {
        name: "Scarlet Red Corset Midi Dress",
        description:
          "An alluring scarlet red midi dress with a structured corset bust and thin spaghetti straps. The A-line skirt flows beautifully below the empire waist. Made from a premium linen blend that's both formal and breathable for Sri Lanka's climate. Perfect for date nights, cocktail parties, or evening events.",
        price: 7800,
        images: [
          "/uploads/products/product-1782072249682-696114262.jpeg",
          "/uploads/products/product-1782072969133-104950001.jpeg",
          "/uploads/products/product-1782073677956-361711441.jpg",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Scarlet Red", stock: 8, sku: "FRK-COR-RED-XS" },
          { size: "S", color: "Scarlet Red", stock: 12, sku: "FRK-COR-RED-S" },
          { size: "M", color: "Scarlet Red", stock: 10, sku: "FRK-COR-RED-M" },
          { size: "L", color: "Scarlet Red", stock: 6, sku: "FRK-COR-RED-L" },
        ],
        tags: ["corset", "midi", "red", "evening", "women"],
      },
      {
        name: "Blush Pink Puff-Sleeve Ball Gown Dress",
        description:
          "An enchanting blush pink ball gown-style dress with short puff sleeves and a full, gathered skirt. The vintage-inspired silhouette and rosy pastel tone make this perfect for weddings, debutante events, or any formal function. Made from premium taffeta fabric for a beautiful structure and luxurious feel.",
        price: 9500,
        images: [
          "/uploads/products/product-1782141597066-854717778.webp",
          "/uploads/products/product-1782141605296-531498317.webp",
          "/uploads/products/product-1782141613381-881586754.webp",
          "/uploads/products/product-1782141623082-634678697.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Blush Pink", stock: 6, sku: "FRK-BGN-BPK-XS" },
          { size: "S", color: "Blush Pink", stock: 8, sku: "FRK-BGN-BPK-S" },
          { size: "M", color: "Blush Pink", stock: 6, sku: "FRK-BGN-BPK-M" },
          { size: "L", color: "Blush Pink", stock: 4, sku: "FRK-BGN-BPK-L" },
        ],
        tags: ["ball gown", "blush", "wedding", "formal", "women"],
      },
      {
        name: "Coral Pink Cross-Back Midi Dress",
        description:
          "A vibrant coral pink midi dress with a flattering cross-back neckline and wide straps. The fitted bodice transitions into a full, pleated skirt that flows beautifully. Made from premium cotton with a comfortable, breathable construction suited for warm Sri Lankan days. Ideal for garden parties, outdoor events, or casual formal occasions.",
        price: 6200,
        images: [
          "/uploads/products/product-1782141843139-110124275.webp",
          "/uploads/products/product-1782141851594-513334303.webp",
          "/uploads/products/product-1782141857266-889727531.webp",
          "/uploads/products/product-1782141862552-654298041.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Coral Pink", stock: 8, sku: "FRK-CRS-CPK-XS" },
          { size: "S", color: "Coral Pink", stock: 12, sku: "FRK-CRS-CPK-S" },
          { size: "M", color: "Coral Pink", stock: 10, sku: "FRK-CRS-CPK-M" },
          { size: "L", color: "Coral Pink", stock: 6, sku: "FRK-CRS-CPK-L" },
        ],
        tags: ["cross-back", "midi", "summer", "coral", "women"],
      },
      {
        name: "Classic Black A-Line Midi Dress",
        description:
          "A sleek, timeless black A-line midi dress with a clean boat neckline and wide shoulder straps. The full, sweeping skirt adds drama and movement. Made from a high-quality structured cotton with a beautiful, modest silhouette. An essential piece for any wardrobe — suited for cocktail parties, formal dinners, and everything in between.",
        price: 6800,
        images: [
          "/uploads/products/product-1782142021712-167048744.webp",
          "/uploads/products/product-1782142027912-372534731.webp",
          "/uploads/products/product-1782142038408-638200860.webp",
          "/uploads/products/product-1782142148107-4319547.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Black", stock: 10, sku: "FRK-ALN-BLK-XS" },
          { size: "S", color: "Black", stock: 15, sku: "FRK-ALN-BLK-S" },
          { size: "M", color: "Black", stock: 12, sku: "FRK-ALN-BLK-M" },
          { size: "L", color: "Black", stock: 8, sku: "FRK-ALN-BLK-L" },
        ],
        tags: ["A-line", "midi", "classic black", "women"],
      },
      {
        name: "Baby Pink Tiered Ruffle Mini Dress",
        description:
          "An adorable baby pink mini dress with tiered ruffle layers that create a whimsical, romantic look. Thin shoulder strap ties add a feminine touch. Made from lightweight cotton blend fabric that dances in the breeze. Ideal for daytime parties, brunches, or casual date nights in Sri Lanka's warm weather.",
        price: 5400,
        images: [
          "/uploads/products/product-1782142374092-955482047.webp",
          "/uploads/products/product-1782142382589-933827055.webp",
          "/uploads/products/product-1782142390845-62596088.webp",
          "/uploads/products/product-1782142413799-808909796.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Baby Pink", stock: 10, sku: "FRK-TRD-BPK-XS" },
          { size: "S", color: "Baby Pink", stock: 15, sku: "FRK-TRD-BPK-S" },
          { size: "M", color: "Baby Pink", stock: 12, sku: "FRK-TRD-BPK-M" },
          { size: "L", color: "Baby Pink", stock: 7, sku: "FRK-TRD-BPK-L" },
        ],
        tags: ["mini", "ruffled", "tiered", "pink", "women"],
      },
      {
        name: "Black Halter Deep V-Neck Dress",
        description:
          "A glamorous and sultry black halter dress with a dramatic deep V-neckline and gathered waist. The flared skirt creates an hourglass silhouette. Made from a smooth, comfortable matte fabric with a beautiful drape. Perfect for night events, beach parties, or anywhere you want to feel bold and beautiful.",
        price: 5900,
        images: [
          "/uploads/products/product-1782142609437-701222232.webp",
          "/uploads/products/product-1782142618792-462345844.webp",
          "/uploads/products/product-1782142626978-148513185.webp",
          "/uploads/products/product-1782142634663-577090116.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Black", stock: 8, sku: "FRK-HLT-BLK-XS" },
          { size: "S", color: "Black", stock: 12, sku: "FRK-HLT-BLK-S" },
          { size: "M", color: "Black", stock: 10, sku: "FRK-HLT-BLK-M" },
          { size: "L", color: "Black", stock: 6, sku: "FRK-HLT-BLK-L" },
        ],
        tags: ["halter", "deep V", "evening", "black", "women"],
      },
      {
        name: "Dark Floral Garden Mini Dress",
        description:
          "A lush and romantic dark floral mini dress with intricate botanical prints on a dark base. Features wide shoulder strap tie closures and a sweetheart-style corset bust. Made from a premium jacquard-like floral fabric. A show-stopping choice for garden parties, weddings, or any occasion that calls for artistic elegance.",
        price: 7200,
        images: [
          "/uploads/products/product-1782142921130-934303445.webp",
          "/uploads/products/product-1782142934344-772738305.webp",
          "/uploads/products/product-1782142944554-713098599.webp",
          "/uploads/products/product-1782142964784-276433254.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Dark Floral", stock: 8, sku: "FRK-FLR-DRK-XS" },
          { size: "S", color: "Dark Floral", stock: 12, sku: "FRK-FLR-DRK-S" },
          { size: "M", color: "Dark Floral", stock: 10, sku: "FRK-FLR-DRK-M" },
          { size: "L", color: "Dark Floral", stock: 6, sku: "FRK-FLR-DRK-L" },
        ],
        tags: ["floral", "mini", "dark", "garden", "women"],
      },
      {
        name: "Navy Blue V-Back A-Line Cocktail Dress",
        description:
          "An elegant navy blue cocktail dress with a structured deep V-back and button detailing. The full-skirted A-line silhouette creates a vintage-inspired charm ideal for formal events and cocktail parties. Made from structured cotton blend fabric with excellent drape. A sophisticated choice for women who love classic, feminine style.",
        price: 6500,
        images: [
          "/uploads/products/product-1782143168151-844793577.webp",
          "/uploads/products/product-1782143177952-592272286.webp",
          "/uploads/products/product-1782143186667-445061832.webp",
          "/uploads/products/product-1782143194854-472664311.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Navy Blue", stock: 8, sku: "FRK-ALN-NVY-XS" },
          { size: "S", color: "Navy Blue", stock: 12, sku: "FRK-ALN-NVY-S" },
          { size: "M", color: "Navy Blue", stock: 10, sku: "FRK-ALN-NVY-M" },
          { size: "L", color: "Navy Blue", stock: 6, sku: "FRK-ALN-NVY-L" },
        ],
        tags: ["cocktail", "A-line", "navy", "formal", "women"],
      },
      {
        name: "White Tie-Shoulder Flared Midi Dress",
        description:
          "A pristine white midi dress with elegant tie-bow shoulder straps and a flowing flared skirt. The fitted bodice transitions into a full, gathered skirt that creates a beautiful, romantic silhouette. Made from premium cotton poplin with a smooth, structured finish. Perfect for weddings, garden parties, engagement events, or any occasion celebrating love and elegance.",
        price: 7800,
        images: [
          "/uploads/products/product-1782195662212-412940032.webp",
          "/uploads/products/product-1782195670950-874439038.webp",
          "/uploads/products/product-1782195702749-794059335.webp",
          "/uploads/products/product-1782195712653-398995095.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "White", stock: 8, sku: "FRK-TIE-WHT-XS" },
          { size: "S", color: "White", stock: 12, sku: "FRK-TIE-WHT-S" },
          { size: "M", color: "White", stock: 10, sku: "FRK-TIE-WHT-M" },
          { size: "L", color: "White", stock: 6, sku: "FRK-TIE-WHT-L" },
        ],
        tags: ["midi", "white", "tie-shoulder", "bridal", "women"],
      },
      {
        name: "Indigo Batik Floral Maxi Dress",
        description:
          "A stunning hand-print batik maxi dress in rich indigo blue with intricate floral and paisley motifs. Made from lightweight cotton that breathes perfectly in Sri Lanka's tropical climate. The sleeveless design and flowing A-line silhouette are elegant and modest. A unique, artisanal piece celebrating South Asian craft heritage.",
        price: 6800,
        images: [
          "/uploads/products/product-1782196001931-454634887.webp",
          "/uploads/products/product-1782196009611-791067582.webp",
          "/uploads/products/product-1782196018177-197055286.webp",
          "/uploads/products/product-1782196025607-702388202.webp",
          "/uploads/products/product-1782196038115-962235387.webp",
        ],
        category: "Frock",
        gender: "women",
        status: "approved",
        variants: [
          { size: "XS", color: "Indigo Blue", stock: 10, sku: "FRK-BTK-IND-XS" },
          { size: "S", color: "Indigo Blue", stock: 14, sku: "FRK-BTK-IND-S" },
          { size: "M", color: "Indigo Blue", stock: 12, sku: "FRK-BTK-IND-M" },
          { size: "L", color: "Indigo Blue", stock: 8, sku: "FRK-BTK-IND-L" },
        ],
        tags: ["batik", "maxi", "floral", "artisanal", "women"],
      },
    ];

    // Add createdBy to all products
    const productsWithAdmin = products.map((p) => ({
      ...p,
      createdBy: admin._id,
    }));

    const inserted = await Product.insertMany(productsWithAdmin);
    console.log(`\n✅ Successfully seeded ${inserted.length} products across 5 categories:`);

    const countByCategory = {};
    products.forEach((p) => {
      countByCategory[p.category] = (countByCategory[p.category] || 0) + 1;
    });
    Object.entries(countByCategory).forEach(([cat, count]) => {
      console.log(`   • ${cat}: ${count} product(s)`);
    });

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
