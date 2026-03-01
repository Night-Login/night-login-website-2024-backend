const User = require("../models/userModels");

/*
  DESC        : Check if user has the required role
  PARAMS      : Allowed roles (spread)
  NOTES       : Must be used after ensureAuthenticated middleware
*/
exports.requireRole = (...roles) => async (req, res, next) => {
  try {
    const user = await User.findById(req._id).select("role");

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        status: 403,
        message: "Access denied. Required role: admin or leader",
        data: null
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to verify user role",
      data: null,
      error: err.message
    });
  }
};
