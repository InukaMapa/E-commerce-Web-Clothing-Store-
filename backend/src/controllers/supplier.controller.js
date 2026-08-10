const Supplier = require("../models/Supplier");
const RawMaterial = require("../models/RawMaterial");
const PurchaseOrder = require("../models/PurchaseOrder");
const SupplierPayment = require("../models/SupplierPayment");

// Helper function to seed initial data if empty
const seedProcurementData = async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count > 0) return;

    console.log("Seeding mock procurement data...");
    const mockSuppliers = [
      {
        name: "Apex Fabrics",
        companyName: "Apex Textiles Ltd.",
        contactPerson: "John Doe",
        phoneNumber: "+1-555-0190",
        email: "contact@apextex.com",
        address: "102 Fabric Industrial Ave, Charlotte, NC 28202",
        materialCategory: "Fabric",
        suppliedMaterials: "Cotton Fabric, Denim Fabric, Polyester Fabric",
        paymentTerms: "Net 30",
        status: "Active"
      },
      {
        name: "Trim & Button Co.",
        companyName: "Trim & Accessories Inc.",
        contactPerson: "Sarah Jenkins",
        phoneNumber: "+1-555-0182",
        email: "info@trimbutton.com",
        address: "Building B, Xinghai Industrial Park, Guangzhou, GD",
        materialCategory: "Accessories",
        suppliedMaterials: "Buttons, Zippers, Metal Button",
        paymentTerms: "Net 15",
        status: "Active"
      },
      {
        name: "Eco Thread Co.",
        companyName: "Eco-Friendly Thread Corp.",
        contactPerson: "Robert Chen",
        phoneNumber: "+86-21-555-9128",
        email: "sales@ecothread.cn",
        address: "66 Green Road, Pudong District, Shanghai",
        materialCategory: "Accessories",
        suppliedMaterials: "Threads, Polyester Thread",
        paymentTerms: "COD",
        status: "Active"
      }
    ];

    for (const s of mockSuppliers) {
      const supplier = new Supplier(s);
      await supplier.save();

      // Seed raw materials and purchase orders for each supplier
      if (s.name === "Apex Fabrics") {
        const mat1 = new RawMaterial({
          name: "Cotton Fabric",
          category: "Fabric",
          unit: "Meter",
          unitPrice: 450,
          currentStock: 100,
          supplierId: supplier._id,
          supplierName: supplier.name
        });
        await mat1.save();

        const po1 = new PurchaseOrder({
          poNumber: "PO-0001",
          supplierId: supplier._id,
          supplierName: supplier.name,
          rawMaterialName: mat1.name,
          rawMaterialId: mat1._id,
          unit: mat1.unit,
          unitPrice: mat1.unitPrice,
          quantity: 100,
          totalAmount: 45000,
          paidAmount: 20000,
          remainingAmount: 25000,
          paymentStatus: "Partially Paid"
        });
        await po1.save();

        const pay1 = new SupplierPayment({
          purchaseOrderId: po1._id,
          supplierId: supplier._id,
          amount: 20000,
          notes: "Initial payment on registration"
        });
        await pay1.save();
      } else if (s.name === "Trim & Button Co.") {
        const mat2 = new RawMaterial({
          name: "Buttons",
          category: "Accessories",
          unit: "Piece",
          unitPrice: 15,
          currentStock: 2500,
          supplierId: supplier._id,
          supplierName: supplier.name
        });
        await mat2.save();

        const po2 = new PurchaseOrder({
          poNumber: "PO-0002",
          supplierId: supplier._id,
          supplierName: supplier.name,
          rawMaterialName: mat2.name,
          rawMaterialId: mat2._id,
          unit: mat2.unit,
          unitPrice: mat2.unitPrice,
          quantity: 2500,
          totalAmount: 37500,
          paidAmount: 37500,
          remainingAmount: 0,
          paymentStatus: "Paid"
        });
        await po2.save();

        const pay2 = new SupplierPayment({
          purchaseOrderId: po2._id,
          supplierId: supplier._id,
          amount: 37500,
          notes: "Fully paid order"
        });
        await pay2.save();
      }
    }
    console.log("Mock procurement data seeded successfully.");
  } catch (err) {
    console.error("Error seeding mock procurement data:", err);
  }
};

// 1. Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    await seedProcurementData();
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: suppliers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Get single supplier details with history and summary
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    // Raw Materials supplied by this supplier
    const rawMaterials = await RawMaterial.find({ supplierId: supplier._id });

    // Purchase Orders
    const purchaseOrders = await PurchaseOrder.find({ supplierId: supplier._id }).sort({ createdAt: -1 });

    // Payment History (all payments associated with this supplier)
    const payments = await SupplierPayment.find({ supplierId: supplier._id })
      .populate("purchaseOrderId", "poNumber rawMaterialName")
      .sort({ paymentDate: -1 });

    // Calculate Summary
    let totalPurchases = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    purchaseOrders.forEach((po) => {
      totalPurchases += po.totalAmount;
      totalPaid += po.paidAmount;
      totalOutstanding += po.remainingAmount;
    });

    return res.status(200).json({
      success: true,
      data: {
        supplier,
        rawMaterials,
        purchaseOrders,
        payments,
        summary: {
          totalPurchases,
          totalPaid,
          totalOutstanding,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Create or update supplier (and handle raw material & PO creation if supplied)
exports.createOrUpdateSupplier = async (req, res) => {
  try {
    const {
      id, // Pass if editing existing supplier
      name,
      companyName,
      contactPerson,
      phoneNumber,
      email,
      address,
      materialCategory,
      suppliedMaterials,
      paymentTerms,
      status,

      // Optional Raw Material & Purchase Order fields
      rawMaterialName,
      unit,
      unitPrice,
      quantity,
      initialPayment,
    } = req.body;

    if (!name || !companyName || !contactPerson || !email) {
      return res.status(400).json({ success: false, message: "Missing required supplier fields." });
    }

    let supplier;

    if (id) {
      // Edit mode
      supplier = await Supplier.findByIdAndUpdate(
        id,
        {
          name,
          companyName,
          contactPerson,
          phoneNumber,
          email,
          address,
          materialCategory,
          suppliedMaterials,
          paymentTerms,
          status,
        },
        { new: true }
      );
      if (!supplier) {
        return res.status(404).json({ success: false, message: "Supplier not found." });
      }
    } else {
      // Create mode
      supplier = new Supplier({
        name,
        companyName,
        contactPerson,
        phoneNumber,
        email,
        address,
        materialCategory,
        suppliedMaterials: suppliedMaterials || rawMaterialName || "Generic Supplies",
        paymentTerms,
        status,
      });
      await supplier.save();
    }

    // If raw material details are provided, automate the Raw Material -> PO -> Payment flow
    if (rawMaterialName && unit && typeof unitPrice !== "undefined" && typeof quantity !== "undefined") {
      const priceVal = Number(unitPrice);
      const qtyVal = Number(quantity);
      const initPayVal = Number(initialPayment || 0);

      // Business logic validations
      if (priceVal < 0) {
        return res.status(400).json({ success: false, message: "Unit price cannot be negative." });
      }
      if (qtyVal <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be greater than zero." });
      }
      if (initPayVal < 0) {
        return res.status(400).json({ success: false, message: "Initial payment cannot be negative." });
      }

      const totalAmount = priceVal * qtyVal;
      if (initPayVal > totalAmount) {
        return res.status(400).json({ success: false, message: "Payment cannot exceed the total amount." });
      }

      // Find or create Raw Material
      let rawMaterial = await RawMaterial.findOne({
        name: rawMaterialName.trim(),
        supplierId: supplier._id,
      });

      if (rawMaterial) {
        // Update existing raw material stock and price
        rawMaterial.currentStock += qtyVal;
        rawMaterial.unitPrice = priceVal;
        rawMaterial.unit = unit; // update unit just in case
        await rawMaterial.save();
      } else {
        // Create new raw material
        rawMaterial = new RawMaterial({
          name: rawMaterialName.trim(),
          category: materialCategory || "Fabric",
          unit,
          unitPrice: priceVal,
          currentStock: qtyVal,
          supplierId: supplier._id,
          supplierName: supplier.name,
        });
        await rawMaterial.save();
      }

      // Generate sequential PO Number
      const lastPO = await PurchaseOrder.findOne().sort({ createdAt: -1 });
      let nextNumber = 1;
      if (lastPO && lastPO.poNumber) {
        const match = lastPO.poNumber.match(/PO-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      const poNumber = `PO-${nextNumber.toString().padStart(4, "0")}`;

      // Create Purchase Order
      const remainingAmount = totalAmount - initPayVal;
      const paymentStatus = initPayVal === totalAmount ? "Paid" : initPayVal > 0 ? "Partially Paid" : "Unpaid";

      const purchaseOrder = new PurchaseOrder({
        poNumber,
        supplierId: supplier._id,
        supplierName: supplier.name,
        rawMaterialName: rawMaterial.name,
        rawMaterialId: rawMaterial._id,
        unit,
        unitPrice: priceVal,
        quantity: qtyVal,
        totalAmount,
        paidAmount: initPayVal,
        remainingAmount,
        paymentStatus,
      });
      await purchaseOrder.save();

      // If initial payment is made, record in SupplierPayment
      if (initPayVal > 0) {
        const supplierPayment = new SupplierPayment({
          purchaseOrderId: purchaseOrder._id,
          supplierId: supplier._id,
          amount: initPayVal,
          paymentMethod: "Cash",
          notes: "Initial payment on registration/purchase",
        });
        await supplierPayment.save();
      }
    }

    return res.status(200).json({ success: true, data: supplier });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Supplier deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Get all raw materials
exports.getAllRawMaterials = async (req, res) => {
  try {
    const materials = await RawMaterial.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: materials });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Get all purchase orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Make a payment / Add payment to a PO
exports.addPaymentToPO = async (req, res) => {
  try {
    const { amount, paymentMethod, notes } = req.body;
    const paymentVal = Number(amount);

    if (!paymentVal || paymentVal <= 0) {
      return res.status(400).json({ success: false, message: "Payment amount must be greater than zero." });
    }

    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: "Purchase order not found." });
    }

    if (paymentVal > po.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount exceeds remaining balance of Rs. ${po.remainingAmount.toFixed(2)}`,
      });
    }

    // Update PO amounts
    po.paidAmount += paymentVal;
    po.remainingAmount = po.totalAmount - po.paidAmount;
    po.paymentStatus = po.paidAmount === po.totalAmount ? "Paid" : "Partially Paid";

    await po.save();

    // Create payment entry
    const payment = new SupplierPayment({
      purchaseOrderId: po._id,
      supplierId: po.supplierId,
      amount: paymentVal,
      paymentMethod: paymentMethod || "Cash",
      notes: notes || "Supplier Payment Update",
    });
    await payment.save();

    return res.status(200).json({ success: true, data: po });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Get complete payment history or payments filtered by supplier
exports.getAllPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.supplierId) {
      filter.supplierId = req.query.supplierId;
    }
    const payments = await SupplierPayment.find(filter)
      .populate("purchaseOrderId", "poNumber rawMaterialName")
      .sort({ paymentDate: -1 });
    return res.status(200).json({ success: true, data: payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 9. Add a standalone Purchase Order for existing supplier
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, rawMaterialName, unit, unitPrice, quantity, initialPayment } = req.body;

    if (!supplierId || !rawMaterialName || !unit || !unitPrice || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required purchase order fields." });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found." });
    }

    const priceVal = Number(unitPrice);
    const qtyVal = Number(quantity);
    const initPayVal = Number(initialPayment || 0);

    if (priceVal < 0) {
      return res.status(400).json({ success: false, message: "Unit price cannot be negative." });
    }
    if (qtyVal <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be greater than zero." });
    }
    if (initPayVal < 0) {
      return res.status(400).json({ success: false, message: "Initial payment cannot be negative." });
    }

    const totalAmount = priceVal * qtyVal;
    if (initPayVal > totalAmount) {
      return res.status(400).json({ success: false, message: "Initial payment cannot exceed total amount." });
    }

    // Find or create Raw Material
    let rawMaterial = await RawMaterial.findOne({
      name: rawMaterialName.trim(),
      supplierId: supplier._id,
    });

    if (rawMaterial) {
      rawMaterial.currentStock += qtyVal;
      rawMaterial.unitPrice = priceVal;
      rawMaterial.unit = unit;
      await rawMaterial.save();
    } else {
      rawMaterial = new RawMaterial({
        name: rawMaterialName.trim(),
        category: supplier.materialCategory || "Fabric",
        unit,
        unitPrice: priceVal,
        currentStock: qtyVal,
        supplierId: supplier._id,
        supplierName: supplier.name,
      });
      await rawMaterial.save();
    }

    // Generate PO Number
    const lastPO = await PurchaseOrder.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastPO && lastPO.poNumber) {
      const match = lastPO.poNumber.match(/PO-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const poNumber = `PO-${nextNumber.toString().padStart(4, "0")}`;

    const remainingAmount = totalAmount - initPayVal;
    const paymentStatus = initPayVal === totalAmount ? "Paid" : initPayVal > 0 ? "Partially Paid" : "Unpaid";

    const purchaseOrder = new PurchaseOrder({
      poNumber,
      supplierId: supplier._id,
      supplierName: supplier.name,
      rawMaterialName: rawMaterial.name,
      rawMaterialId: rawMaterial._id,
      unit,
      unitPrice: priceVal,
      quantity: qtyVal,
      totalAmount,
      paidAmount: initPayVal,
      remainingAmount,
      paymentStatus,
    });
    await purchaseOrder.save();

    if (initPayVal > 0) {
      const supplierPayment = new SupplierPayment({
        purchaseOrderId: purchaseOrder._id,
        supplierId: supplier._id,
        amount: initPayVal,
        paymentMethod: "Cash",
        notes: "Initial payment on purchase order creation",
      });
      await supplierPayment.save();
    }

    return res.status(201).json({ success: true, data: purchaseOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
