const User = require("../models/userModels");
const Project = require("../models/projectModel");
const Transaction = require("../models/transactionModels");
const TalentPool = require("../models/talentPoolModel");
const { midtransCoreApi } = require("../config/midtrans");

/*
  DESC        : Get all users with pagination and filters
  PARAMS      : page, limit, role, search (query params)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Paginated list of users
*/
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -salt")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 200,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve users",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get single user by ID
  PARAMS      : id (route param)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : User object without password/salt
*/
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -salt");

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null
      });
    }

    res.status(200).json({
      status: 200,
      message: "User retrieved successfully",
      data: { user }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve user",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Update a user's role
  PARAMS      : id (route param), role (body)
  METHOD      : PUT
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Updated user object
*/
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["member", "lecturer", "admin", "leader", "client"];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid role. Must be one of: member, lecturer, admin, leader, client",
        data: null
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password -salt");

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null
      });
    }

    res.status(200).json({
      status: 200,
      message: "User role updated successfully",
      data: { user }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to update user role",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Delete a user by ID
  PARAMS      : id (route param)
  METHOD      : DELETE
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Success message
*/
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null
      });
    }

    res.status(200).json({
      status: 200,
      message: "User deleted successfully",
      data: null
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to delete user",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get all projects with pagination
  PARAMS      : page, limit, status (query params)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Paginated list of projects with transaction data
*/
exports.getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find()
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 })
        .lean(),
      Project.countDocuments()
    ]);

    // Fetch associated transactions for each project
    const projectIds = projects.map((p) => p._id);
    const transactions = await Transaction.find({
      projectId: { $in: projectIds }
    }).populate("userId", "name email");

    // Map transactions to their projects
    const projectsWithTransactions = projects.map((project) => {
      const projectTransactions = transactions.filter(
        (t) => t.projectId.toString() === project._id.toString()
      );
      return {
        ...project,
        transactions: projectTransactions
      };
    });

    res.status(200).json({
      status: 200,
      message: "Projects retrieved successfully",
      data: {
        projects: projectsWithTransactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve projects",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get single project with transaction details
  PARAMS      : id (route param)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Project object with associated transactions
*/
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();

    if (!project) {
      return res.status(404).json({
        status: 404,
        message: "Project not found",
        data: null
      });
    }

    const transactions = await Transaction.find({
      projectId: project._id
    }).populate("userId", "name email");

    res.status(200).json({
      status: 200,
      message: "Project retrieved successfully",
      data: {
        project: {
          ...project,
          transactions
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve project",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get all transactions with pagination
  PARAMS      : page, limit, status (query params)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Paginated list of transactions with user and project data
*/
exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.transactionStatus = req.query.status;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("userId", "name email role")
        .populate("projectId")
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 }),
      Transaction.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 200,
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve transactions",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get single transaction with populated references
  PARAMS      : id (route param)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Transaction object with user and project data
*/
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("userId", "name email role")
      .populate("projectId");

    if (!transaction) {
      return res.status(404).json({
        status: 404,
        message: "Transaction not found",
        data: null
      });
    }

    res.status(200).json({
      status: 200,
      message: "Transaction retrieved successfully",
      data: { transaction }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve transaction",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get aggregate dashboard statistics
  PARAMS      : None
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Dashboard statistics (users, projects, transactions, revenue)
*/
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      usersByRole,
      totalProjects,
      totalTransactions,
      revenueResult,
      pendingRequests,
      recentRegistrations
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
      Project.countDocuments(),
      Transaction.countDocuments(),
      Transaction.aggregate([
        {
          $match: {
            transactionStatus: { $in: ["settlement", "capture"] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$grossAmount" }
          }
        }
      ]),
      Transaction.countDocuments({ transactionStatus: "pending" }),
      User.find()
        .select("-password -salt")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      status: 200,
      message: "Dashboard statistics retrieved successfully",
      data: {
        totalUsers,
        usersByRole,
        totalProjects,
        totalTransactions,
        totalRevenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
        pendingRequests,
        recentRegistrations
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve dashboard statistics",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get all talent pool entries with pagination
  PARAMS      : page, limit, verified, search (query params)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Paginated list of talent pool entries
*/
exports.getAllTalentPool = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.verified !== undefined) {
      filter.verified = req.query.verified === "true";
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { name: searchRegex },
        { role: searchRegex },
        { email: searchRegex }
      ];
    }

    const [entries, total] = await Promise.all([
      TalentPool.find(filter)
        .populate("userId", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      TalentPool.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 200,
      message: "Talent pool entries retrieved successfully",
      data: {
        entries,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve talent pool entries",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Verify or unverify a talent pool entry
  PARAMS      : id (route param), verified (body)
  METHOD      : PUT
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Updated talent pool entry
*/
exports.verifyTalentPool = async (req, res) => {
  try {
    const { verified } = req.body;

    if (typeof verified !== "boolean") {
      return res.status(400).json({
        status: 400,
        message: "Invalid value. 'verified' must be a boolean",
        data: null
      });
    }

    const entry = await TalentPool.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    ).populate("userId", "name email");

    if (!entry) {
      return res.status(404).json({
        status: 404,
        message: "Talent pool entry not found",
        data: null
      });
    }

    res.status(200).json({
      status: 200,
      message: verified ? "Talent pool entry verified successfully" : "Talent pool entry unverified successfully",
      data: { entry }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to update talent pool entry",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get current Midtrans configuration (non-sensitive)
  PARAMS      : None
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("admin", "leader")
  RESPONSE    : Midtrans configuration status (no secret keys exposed)
*/
exports.getMidtransConfig = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      message: "Midtrans configuration retrieved successfully",
      data: {
        isProduction: midtransCoreApi.apiConfig.isProduction,
        serverKeyConfigured: !!process.env.MIDTRANS_SERVER_KEY,
        clientKeyConfigured: !!process.env.MIDTRANS_CLIENT_KEY
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve Midtrans configuration",
      data: null,
      error: err.message
    });
  }
};
