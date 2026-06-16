const mongoose = require("mongoose");

const customDesignSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tshirtColor: { type: String, default: "white" },
    size:         { type: String, default: "M" },
    quantity:     { type: Number, default: 1 },
    sizeQuantities: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Fabric.js JSON snapshots for front & back
    designs: {
      front: { type: mongoose.Schema.Types.Mixed, default: null },
      back:  { type: mongoose.Schema.Types.Mixed, default: null },
    },

    // Base64 preview image captured from the canvas
    previewImage:      { type: String, default: "" },
    // Per-side preview snapshots (the key part for dual-side display)
    frontPreviewImage: { type: String, default: "" },
    backPreviewImage:  { type: String, default: "" },

    // Workflow status
    status: {
      type: String,
      enum: ["pending", "in-production", "completed", "rejected"],
      default: "pending",
    },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomDesign", customDesignSchema);
