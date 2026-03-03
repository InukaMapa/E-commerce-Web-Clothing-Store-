const Product = require("../models/Product");

// ---------------------------------------------------------------------------
// List products (public) — search, filter, sort, paginate
// ---------------------------------------------------------------------------
exports.list = async (query) => {
  const {
    search,
    minPrice,
    maxPrice,
    size,
    color,
    sort: sortParam,
    page = 1,
    limit = 12,
  } = query;

  const filter = {};

  // ── Full-text / regex search on name & description ──────────────────────
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }

  // ── Price range ─────────────────────────────────────────────────────────
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // ── Variant-level filters ───────────────────────────────────────────────
  if (size) filter["variants.size"] = size;
  if (color) filter["variants.color"] = new RegExp(`^${color}$`, "i");

  // ── Sort ────────────────────────────────────────────────────────────────
  const sortOptions = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
  };
  const sortOrder = sortOptions[sortParam] || { createdAt: -1 };

  // ── Pagination ──────────────────────────────────────────────────────────
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100); // cap at 100
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name email")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

// ---------------------------------------------------------------------------
// Get single product by ID
// ---------------------------------------------------------------------------
exports.getById = async (id) => {
  return Product.findById(id)
    .populate("createdBy", "name email")
    .lean();
};

// ---------------------------------------------------------------------------
// Create product
// ---------------------------------------------------------------------------
exports.create = async (data, userId) => {
  const product = await Product.create({ ...data, createdBy: userId });
  return product.toObject();
};

// ---------------------------------------------------------------------------
// Update product (returns updated doc or null)
// ---------------------------------------------------------------------------
exports.update = async (id, data) => {
  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("createdBy", "name email")
    .lean();
};

// ---------------------------------------------------------------------------
// Delete product (returns deleted doc or null)
// ---------------------------------------------------------------------------
exports.remove = async (id) => {
  return Product.findByIdAndDelete(id).lean();
};
