const { GoogleGenAI } = require("@google/genai");
const productService = require("../services/product.service");
const Order = require("../models/Order");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a friendly, helpful, and experienced clothing store sales assistant.
Your goal is to guide users to find and purchase clothing products from our store.

Rules:
1. Recommend actual products returned by calling the functions (tools). Do NOT make up products.
2. When recommending products, always include their link in the exact format: [Product Name](/products/PRODUCT_ID) (using the actual product's MongoDB ID).
3. If no products match, politely explain that we don't have them in stock and suggest alternatives or general options.
4. Keep responses friendly, helpful, and concise. Don't write excessively long paragraphs.
5. Encourage users toward checking out or viewing products.
6. Remember user preferences from the conversation history (e.g. size, colors, budget, gender). Prioritize these details automatically in your tool calls (e.g. if they say "I wear Medium", search with size: "M" or size: "Medium").
7. If the user asks about order status, call getOrderStatus with the order ID.

`;

const functionDeclarations = [
  {
    name: "searchProducts",
    description: "Search for clothing products in the store by name, description, category, gender, size, color, or price limits.",
    parameters: {
      type: "OBJECT",
      properties: {
        search: { type: "STRING", description: "Keywords in the product name or description" },
        category: { type: "STRING", description: "Category (e.g., T-Shirt, Shirt, Jeans, Skirt, Frock, Jacket, Hoodie, Cargo)" },
        gender: { type: "STRING", description: "Gender (men, women, unisex)" },
        minPrice: { type: "NUMBER", description: "Minimum price in dollars" },
        maxPrice: { type: "NUMBER", description: "Maximum price in dollars" },
        size: { type: "STRING", description: "Size of clothes (e.g. S, M, L, XL, 30, 32, 34)" },
        color: { type: "STRING", description: "Color (e.g. Black, White, Blue, Grey)" },
      }
    }
  },
  {
    name: "getProductDetails",
    description: "Get detailed information about a single product by its ID.",
    parameters: {
      type: "OBJECT",
      properties: {
        productId: { type: "STRING", description: "The product's MongoDB ID" }
      },
      required: ["productId"]
    }
  },
  {
    name: "getNewArrivals",
    description: "Get the latest clothing products in the store.",
    parameters: {
      type: "OBJECT",
      properties: {
        limit: { type: "NUMBER", description: "Number of products to fetch (default: 8)" }
      }
    }
  },
  {
    name: "getBestsellers",
    description: "Get the top-selling or popular products in the store.",
    parameters: {
      type: "OBJECT",
      properties: {
        limit: { type: "NUMBER", description: "Number of products to fetch (default: 8)" }
      }
    }
  },
  {
    name: "getSaleItems",
    description: "Get clothing products that are on sale (under budget/discounted).",
    parameters: {
      type: "OBJECT",
      properties: {
        maxPrice: { type: "NUMBER", description: "Max price threshold (default: 40)" }
      }
    }
  },
  {
    name: "getOrderStatus",
    description: "Track a customer order using the Order ID.",
    parameters: {
      type: "OBJECT",
      properties: {
        orderId: { type: "STRING", description: "The 24-character hexadecimal MongoDB Order ID" }
      },
      required: ["orderId"]
    }
  },
  {
    name: "getStoreInfo",
    description: "Get static store information such as shipping details, delivery times, return policies, payment options, and contact information.",
    parameters: {
      type: "OBJECT",
      properties: {}
    }
  }
];

async function handleToolCall(name, args, reqUser) {
  console.log(`AI called tool: ${name} with args:`, args);
  switch (name) {
    case "searchProducts": {
      // Map parameters to list query options
      const query = {
        search: args.search,
        category: args.category,
        gender: args.gender,
        minPrice: args.minPrice,
        maxPrice: args.maxPrice,
        size: args.size,
        color: args.color,
        limit: 10
      };
      const result = await productService.list(query);
      return { products: result.products.map(p => ({
        id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        gender: p.gender,
        images: p.images,
        variants: p.variants.map(v => ({ size: v.size, color: v.color, stock: v.stock }))
      })) };
    }
    case "getProductDetails": {
      const product = await productService.getById(args.productId);
      if (!product) return { message: "Product not found" };
      return { product: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        gender: product.gender,
        images: product.images,
        variants: product.variants.map(v => ({ size: v.size, color: v.color, stock: v.stock }))
      } };
    }
    case "getNewArrivals": {
      const result = await productService.list({ sort: "newest", limit: args.limit || 8 });
      return { products: result.products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        images: p.images
      })) };
    }
    case "getBestsellers": {
      const result = await productService.list({ sort: "name_asc", limit: args.limit || 8 });
      return { products: result.products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        images: p.images
      })) };
    }
    case "getSaleItems": {
      const result = await productService.list({ maxPrice: args.maxPrice || 40, limit: 8 });
      return { products: result.products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        images: p.images
      })) };
    }
    case "getOrderStatus": {
      try {
        const order = await Order.findById(args.orderId).populate("items.productId");
        if (!order) {
          return { message: "Order not found. Please double-check the Order ID." };
        }
        // If request is authenticated, we can optionally verify user ownership
        if (reqUser && order.user && order.user.toString() !== reqUser.id) {
          return { message: "Order found, but it belongs to another account. Please log in as the correct user to track it." };
        }
        return {
          orderId: order._id,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          items: order.items.map(item => ({
            name: item.productId?.name || "Product",
            quantity: item.quantity,
            price: item.price,
            variant: item.variantName
          }))
        };
      } catch (e) {
        return { message: "Invalid Order ID format. Order IDs should be 24-character hex strings." };
      }
    }
    case "getStoreInfo": {
      return {
        shipping: "We offer standard shipping for $4.99, or free shipping on orders over $50.",
        deliveryTime: "Standard delivery takes 3 to 5 business days. Express next-day shipping is available at checkout.",
        refundAndReturnPolicy: "You can return any unworn items with tags attached within 30 days of purchase for a full refund.",
        paymentMethods: "We accept Visa, MasterCard, American Express, PayPal, and Cash on Delivery.",
        contact: "Email: support@clothingstore.com | Phone: +1-800-555-0199 | Hours: 9 AM - 6 PM (Mon-Fri)."
      };
    }
    default:
      return { error: "Unknown tool: " + name };
  }
}

exports.handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    // Format chat history for Gemini API
    // Gemini contents format is an array of Content objects:
    // { role: "user" | "model", parts: [{ text: "..." }] }
    // Note: The history might contain helper objects, so let's sanitize it.
    let chatHistory = [];
    if (Array.isArray(history)) {
      chatHistory = history.map(h => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content || h.text || "" }]
      }));
    }

    // Append the current message
    chatHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    console.log("Sending chat history with length:", chatHistory.length);

    // Call execution loop
    let finalResponseText = "";
    let loop = 0;
    let currentHistory = [...chatHistory];

    while (loop < 5) {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: currentHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations }]
        }
      });

      const candidate = response.candidates?.[0];
      const content = candidate?.content;
      const parts = content?.parts || [];

      // Look for functionCall
      const functionCalls = parts.filter(p => p.functionCall);

      if (functionCalls.length === 0) {
        finalResponseText = response.text || "";
        break;
      }

      // Add assistant response containing the function calls to history
      currentHistory.push(content);

      // Execute each functionCall
      const toolParts = [];
      for (const part of functionCalls) {
        const { name, args } = part.functionCall;
        const result = await handleToolCall(name, args, req.user);
        toolParts.push({
          functionResponse: {
            name: name,
            response: result
          }
        });
      }

      // Append tool responses
      currentHistory.push({
        role: "tool",
        parts: toolParts
      });

      loop++;
    }

    if (loop >= 5) {
      return res.status(500).json({
        success: false,
        message: "Sorry, the AI assistant hit a query loop. Please try again with a simpler request."
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        text: finalResponseText
      }
    });

  } catch (err) {
    console.error("Chatbot API error:", err);
    return res.status(500).json({
      success: false,
      message: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
    });
  }
};
