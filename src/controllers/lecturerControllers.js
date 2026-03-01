const User = require("../models/userModels");
const Transaction = require("../models/transactionModels");

/*
  DESC        : Get lecturer dashboard statistics
  PARAMS      : None
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("lecturer", "admin", "leader")
  RESPONSE    : Dashboard statistics (totalStudents, totalProjects, recentStudents)
*/
exports.getLecturerDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalProjects, recentStudents] = await Promise.all([
      User.countDocuments({ role: "member" }),
      Transaction.countDocuments(),
      User.find({ role: "member" })
        .select("_id name email createdAt profileData.major profileData.university")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      status: 200,
      message: "Lecturer dashboard statistics retrieved successfully",
      data: {
        totalStudents,
        totalProjects,
        recentStudents
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve lecturer dashboard statistics",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get all projects with pagination and filters
  PARAMS      : page, limit, status, search (query params)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("lecturer", "admin", "leader")
  RESPONSE    : Paginated list of projects
*/
exports.getLecturerProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.transactionStatus = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.projectName = searchRegex;
    }

    const [projects, total] = await Promise.all([
      Transaction.find(filter)
        .populate("userId", "name email")
        .populate("projectId")
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 }),
      Transaction.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 200,
      message: "Lecturer projects retrieved successfully",
      data: {
        projects,
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
      message: "Failed to retrieve lecturer projects",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get all students (members) with pagination and filters
  PARAMS      : page, limit, search, major (query params)
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("lecturer", "admin", "leader")
  RESPONSE    : Paginated list of students
*/
exports.getLecturerStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { role: "member" };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    if (req.query.major) {
      filter["profileData.major"] = req.query.major;
    }

    const [students, total] = await Promise.all([
      User.find(filter)
        .select("-password -salt")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 200,
      message: "Students retrieved successfully",
      data: {
        students,
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
      message: "Failed to retrieve students",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get lecturer's own profile
  PARAMS      : None
  METHOD      : GET
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("lecturer", "admin", "leader")
  RESPONSE    : User object without password/salt
*/
exports.getLecturerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -salt");

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null
      });
    }

    res.status(200).json({
      status: 200,
      message: "Lecturer profile retrieved successfully",
      data: { user }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve lecturer profile",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Update lecturer's own profile
  PARAMS      : name, profileData (body)
  METHOD      : PUT
  VISIBILITY  : Private
  PRE-REQ     : ensureAuthenticated, requireRole("lecturer", "admin", "leader")
  RESPONSE    : Updated user object without password/salt
*/
exports.updateLecturerProfile = async (req, res) => {
  try {
    const { name, profileData } = req.body;
    const updateFields = {};

    if (name) {
      updateFields.name = name;
    }

    if (profileData) {
      const allowedFields = ["phone", "bio", "department", "specialization", "officeRoom"];
      for (const field of allowedFields) {
        if (profileData[field] !== undefined) {
          updateFields[`profileData.${field}`] = profileData[field];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
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
      message: "Lecturer profile updated successfully",
      data: { user }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to update lecturer profile",
      data: null,
      error: err.message
    });
  }
};
