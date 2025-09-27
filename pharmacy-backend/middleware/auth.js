const jwt = require("jsonwebtoken");

module.exports = {
  // ✅ Verify JWT token
  authenticate: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // attach decoded user {id, role} to request
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
  },

  // ✅ Role-based authorization
  authorizeRoles: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }
      next();
    };
  }
};
