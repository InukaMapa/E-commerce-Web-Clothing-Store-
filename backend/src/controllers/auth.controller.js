const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ["customer", "producer", "admin"];

/**
 * Build a signed JWT for the given user document.
 * Payload contains only the minimum claims needed downstream.
 */
const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

/**
 * Strip sensitive fields before sending a user object to the client.
 */
const sanitiseUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
        data: null,
      });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        data: null,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
        data: null,
      });
    }

    // ── Duplicate check ───────────────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        data: null,
      });
    }

    // ── Determine role ────────────────────────────────────────────────────
    // Only an authenticated admin may assign a non-default role.
    let assignedRole = "customer";
    if (role && VALID_ROLES.includes(role)) {
      if (req.user && req.user.role === "admin") {
        assignedRole = role;
      }
      // Silently fall back to "customer" for non-admins to avoid leaking
      // information about valid role values.
    }

    // ── Create user ───────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user: sanitiseUser(user), token },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        data: null,
      });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        data: null,
      });
    }

    // ── Authenticate ──────────────────────────────────────────────────────
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: sanitiseUser(user), token },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/me   (protected — requires valid JWT)
// ---------------------------------------------------------------------------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: { user },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};
