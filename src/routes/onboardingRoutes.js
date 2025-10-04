const onboardingRoutes = require("express").Router();

const { ensureAuthenticated } = require("../middlewares/userMiddlewares");

const { 
  getOnboardingStatus, 
  completeOnboarding,
  getUserProfile
} = require("../controllers/onboardingControllers");

// Get onboarding status
onboardingRoutes.get("/status", ensureAuthenticated, getOnboardingStatus);

// Complete onboarding
onboardingRoutes.post("/complete", ensureAuthenticated, completeOnboarding);

// Get user profile
onboardingRoutes.get("/profile", ensureAuthenticated, getUserProfile);

module.exports = onboardingRoutes;
