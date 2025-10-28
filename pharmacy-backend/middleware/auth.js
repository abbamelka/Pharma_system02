const jwt = require("jsonwebtoken");
const User = require("../models/user");
const UserRoles = require("../models/UserRole");
const Role = require("../models/role");

// 🔹 Verify JWT token and attach user to request
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Decoded token:', decoded);

    // Fetch user with their roles
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'Roles',
        through: { attributes: [] }
      }]
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Extract role names from database
    let userRoleNames = [];
    if (user.Roles && Array.isArray(user.Roles) && user.Roles.length > 0) {
      userRoleNames = user.Roles.map(role => role.name);
    } else {
      // If no roles in database, use JWT role as primary source
      console.log('No roles in database, using JWT role:', decoded.role);
      userRoleNames = decoded.role ? [decoded.role] : [];
    }

    console.log('User roles from database:', userRoleNames);

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: userRoleNames,
      status: user.status
    };

    console.log('Final req.user:', req.user);

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🔹 Restrict to Super Admin only
exports.requireSuperAdmin = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "User not authenticated" });

  // Check if user has superadmin role
  const isSuperAdmin = req.user.roles.some(
    role => role.toLowerCase() === "superadmin"
  );

  if (!isSuperAdmin)
    return res.status(403).json({ message: "Access denied. Superadmin only." });

  next();
};

// 🔹 Generic role-based authorization middleware
exports.authorizeRoles = (...roleNames) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "User not authenticated" });

    // Normalize role names to lowercase for comparison
    const normalizedRoleNames = roleNames.map(role => role.toLowerCase());
    
    // Check if user has any of the required roles
    const hasRole = req.user.roles.some(userRole =>
      normalizedRoleNames.includes(userRole.toLowerCase())
    );

    if (!hasRole) {
      return res.status(403).json({ 
        message: `Access denied. Requires one of: ${roleNames.join(", ")}` 
      });
    }

    next();
  };
};

// 🔹 Optional: Middleware to check if user has any role (is authenticated)
exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};