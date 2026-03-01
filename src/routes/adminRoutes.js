const adminRoutes = require("express").Router();

const { ensureAuthenticated } = require("../middlewares/userMiddlewares");
const { requireRole } = require("../middlewares/roleMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllProjects,
  getProjectById,
  getAllTransactions,
  getTransactionById,
  getDashboardStats,
  getAllTalentPool,
  verifyTalentPool,
  getMidtransConfig
} = require("../controllers/adminControllers");

// All admin routes require authentication and admin/leader role
adminRoutes.use(ensureAuthenticated, requireRole("admin", "leader"));

// User management
adminRoutes.get("/users", getAllUsers);
adminRoutes.get("/users/:id", getUserById);
adminRoutes.put("/users/:id/role", updateUserRole);
adminRoutes.delete("/users/:id", deleteUser);

// Project management
adminRoutes.get("/projects", getAllProjects);
adminRoutes.get("/projects/:id", getProjectById);

// Transaction management
adminRoutes.get("/transactions", getAllTransactions);
adminRoutes.get("/transactions/:id", getTransactionById);

// Dashboard statistics
adminRoutes.get("/stats", getDashboardStats);

// Talent pool management
adminRoutes.get("/talent-pool", getAllTalentPool);
adminRoutes.put("/talent-pool/:id/verify", verifyTalentPool);

// Midtrans configuration
adminRoutes.get("/midtrans-config", getMidtransConfig);

module.exports = adminRoutes;
