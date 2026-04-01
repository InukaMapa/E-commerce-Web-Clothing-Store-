require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/producer", require("./routes/producer.routes"));
app.use("/api/upload", require("./routes/upload.routes"));

app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

const recommendationRoutes = require("./routes/recommendationRoutes");

app.use("/api/recommendations", recommendationRoutes);