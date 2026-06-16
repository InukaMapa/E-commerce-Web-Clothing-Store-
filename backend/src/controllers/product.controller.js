const mongoose = require("mongoose");
const productService = require("../services/product.service");
const auditService = require("../services/audit.service");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Validate the core product payload shared by create & update.
 * Returns an error string or null if valid.
 */
const validateProduct = (body, { partial = false } = {}) => {
  const { name, price, variants } = body;

  if (!partial) {
    if (!name || typeof name !== "string" || !name.trim()) {
      return "Product name is required";
    }
  }

  // Price must be > 0 when provided
  if (price !== undefined) {
    if (typeof price !== "number" || price <= 0) {
      return "Price must be a number greater than 0";
    }
  } else if (!partial) {
    return "Price is required";
  }

  // Variant-level validation when provided
  if (variants !== undefined) {
    if (!Array.isArray(variants)) return "Variants must be an array";

    const skus = new Set();
    for (const v of variants) {
      if (v.stock !== undefined && (typeof v.stock !== "number" || v.stock < 0)) {
        return "Variant stock must be a number >= 0";
      }
      if (v.sku) {
        if (skus.has(v.sku)) {
          return `Duplicate SKU within product: ${v.sku}`;
        }
        skus.add(v.sku);
      }
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// GET /api/products  (public)
// ---------------------------------------------------------------------------
exports.getProducts = async (req, res) => {
  try {
    const result = await productService.list(req.query);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("getProducts error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/products/:id  (public)
// ---------------------------------------------------------------------------
exports.getProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        data: null,
      });
    }

    const product = await productService.getById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: { product },
    });
  } catch (err) {
    console.error("getProduct error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/products  (producer | admin)
// ---------------------------------------------------------------------------
exports.createProduct = async (req, res) => {
  try {
    const validationError = validateProduct(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
        data: null,
      });
    }

    const { name, description, price, images, variants, category, gender, status } = req.body;
    const product = await productService.create(
      { name, description, price, images, variants, category, gender, status },
      req.user.id
    );

    // ── Audit Log ─────────────────────────────────────────────────────────
    await auditService.logAction({
      actorUserId: req.user.id,
      action: "PRODUCT_CREATED",
      entityType: "Product",
      entityId: product._id,
      after: product,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/products/:id  (producer — own only | admin — any)
// ---------------------------------------------------------------------------
exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        data: null,
      });
    }

    // Fetch existing product to check ownership
    const existing = await productService.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Producers can only edit their own products
    if (
      req.user.role === "producer" &&
      existing.createdBy?._id?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own products",
        data: null,
      });
    }

    const validationError = validateProduct(req.body, { partial: true });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
        data: null,
      });
    }

    const { name, description, price, images, variants, category, gender, status } = req.body;
    const product = await productService.update(req.params.id, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(images !== undefined && { images }),
      ...(variants !== undefined && { variants }),
      ...(category !== undefined && { category }),
      ...(gender !== undefined && { gender }),
      ...(status !== undefined && { status }),
    });

    // ── Audit Log ─────────────────────────────────────────────────────────
    await auditService.logAction({
      actorUserId: req.user.id,
      action: "PRODUCT_UPDATED",
      entityType: "Product",
      entityId: product._id,
      before: existing,
      after: product,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/products/:id  (admin only)
// ---------------------------------------------------------------------------
exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
        data: null,
      });
    }

    const product = await productService.remove(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // ── Audit Log ─────────────────────────────────────────────────────────
    await auditService.logAction({
      actorUserId: req.user.id,
      action: "PRODUCT_DELETED",
      entityType: "Product",
      entityId: product._id,
      before: product,
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};
