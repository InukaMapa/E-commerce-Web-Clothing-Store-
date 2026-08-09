const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required", data: null });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden — insufficient role", data: null });
      }

      next();
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token", data: null });
    }
  };
};