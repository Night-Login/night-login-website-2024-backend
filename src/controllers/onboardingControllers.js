const User = require("../models/userModels");

/*
  DESC        : Get user onboarding status
  PARAMS      : User ID from JWT
  METHOD      : GET
  VISIBILITY  : Private (requires authentication)
  PRE-REQ     : ensureAuthenticated middleware
  RESPONSE    : Onboarding status and user role
*/
exports.getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req._id).select("onboardingCompleted role email name");
    
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null
      });
    }
    
    res.status(200).json({
      status: 200,
      message: "Onboarding status retrieved successfully",
      data: {
        onboardingCompleted: user.onboardingCompleted,
        role: user.role,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to get onboarding status",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Complete user onboarding
  PARAMS      : role, profileData (role-specific fields)
  METHOD      : POST
  VISIBILITY  : Private (requires authentication)
  PRE-REQ     : ensureAuthenticated middleware
  RESPONSE    : Updated user data
*/
exports.completeOnboarding = async (req, res) => {
  try {
    const { role, profileData, verificationCode } = req.body;
    
    // Debug logging
    console.log("Onboarding request received:");
    console.log("- Role:", role);
    console.log("- Verification Code:", verificationCode);
    console.log("- Profile Data:", profileData);
    
    // Validate role
    const validRoles = ["member", "lecturer", "admin", "leader", "client"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid role. Must be one of: member, lecturer, admin, leader, client",
        data: null
      });
    }
    
    // Validate verification code for admin and leader roles
    if (role === "admin" || role === "leader") {
      if (!verificationCode || verificationCode !== "NightLogin123") {
        console.log("❌ Verification code validation failed");
        console.log("   Expected: NightLogin123");
        console.log("   Received:", verificationCode);
        return res.status(403).json({
          status: 403,
          message: "Invalid verification code. Admin and Leader roles require a valid verification code.",
          data: null
        });
      }
      console.log("✅ Verification code validated successfully");
    }
    
    // Update user with role and profile data
    const user = await User.findByIdAndUpdate(
      req._id,
      {
        role: role,
        onboardingCompleted: true,
        profileData: profileData || {}
      },
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
      message: "Onboarding completed successfully",
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          profileData: user.profileData
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to complete onboarding",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : Get user profile
  PARAMS      : User ID from JWT
  METHOD      : GET
  VISIBILITY  : Private (requires authentication)
  PRE-REQ     : ensureAuthenticated middleware
  RESPONSE    : User profile with role and data
*/
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req._id).select("-password -salt");
    
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null
      });
    }
    
    res.status(200).json({
      status: 200,
      message: "User profile retrieved successfully",
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          profileData: user.profileData,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to get user profile",
      data: null,
      error: err.message
    });
  }
};
