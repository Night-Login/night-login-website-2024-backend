const User = require("../models/userModels");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/*
  DESC        : Register a new user
  PARAMS      : email, name, password, salt
  METHOD      : POST
  VISIBILITY  : Public
  PRE-REQ     : create hashed password and generate salt using middlewares/register.js
  RESPONSE    : Success message with user data and token
*/
exports.registerUser = async (req, res) => {
  const { email, name } = req.body;
  const password = req.password;
  const salt = req.salt;

  const newUser = new User({
    email,
    name,
    password,
    salt
  });

  try {
    const savedUser = await newUser.save();
    
    // Generate token for auto-login after registration
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
    
    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: {
        user: {
          id: savedUser._id.toString(),
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
          onboardingCompleted: savedUser.onboardingCompleted
        },
        token: token,
        accessToken: token
      }
    });
  } catch (err) {
    if (err.errorResponse && err.errorResponse.code === 11000) {
      return res.status(400).json({
        status: 400,
        message: "Error! Email already exists!",
        data: null
      });
    } else if (err.message && err._message == "User validation failed") {
      return res.status(409).json({
        status: 409,
        message: "Error! Enum validation failed!",
        data: null
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: "Failed to register user",
        data: null,
        error: err.message
      });
    }
  }
};

/*
  DESC        : Login user
  PARAMS      : email and password
  METHOD      : POST
  VISIBILITY  : Public
  PRE-REQ     : -
  RESPONSE    : JWT token with user data
*/
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user with password and salt for validation
    const userAuth = await User.findOne({ email }).select("password salt");
    
    if (!userAuth) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password + userAuth.salt)
      .digest("hex");

    if (hashedPassword !== userAuth.password) {
      return res.status(400).json({
        status: 400,
        message: "Invalid credentials!",
        data: null
      });
    }

    // Generate token
    const token = jwt.sign({ _id: userAuth._id }, process.env.JWT_SECRET);
    
    // Fetch full user data without password and salt
    const fullUser = await User.findById(userAuth._id).select("-password -salt");
    
    res.status(200).json({
      status: 200,
      message: "Login successful",
      data: {
        user: {
          id: fullUser._id.toString(),
          email: fullUser.email,
          name: fullUser.name,
          role: fullUser.role,
          onboardingCompleted: fullUser.onboardingCompleted
        },
        token: token,
        accessToken: token
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to login user",
      data: null,
      error: err.message
    });
  }
};

/*
  DESC        : OAuth login/register (Google/GitHub)
  PARAMS      : email, name, provider, providerId, image (optional)
  METHOD      : POST
  VISIBILITY  : Public
  PRE-REQ     : -
  RESPONSE    : JWT token with user data
*/
exports.oauthLogin = async (req, res) => {
  const { email, name, provider, providerId, image } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email }).select("-password -salt");
    
    if (user) {
      // User exists, generate token and return
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      
      return res.status(200).json({
        status: 200,
        message: "Login successful",
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted
          },
          token: token,
          accessToken: token
        }
      });
    }
    
    // User doesn't exist, create new user with OAuth
    // Generate a random password and salt for OAuth users
    const salt = crypto.randomBytes(16).toString("hex");
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = crypto
      .createHash("sha256")
      .update(randomPassword + salt)
      .digest("hex");
    
    const newUser = new User({
      email,
      name: name || email.split('@')[0], // Use email prefix if name not provided
      password: hashedPassword,
      salt
    });
    
    const savedUser = await newUser.save();
    
    // Generate token for the new user
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
    
    res.status(201).json({
      status: 201,
      message: "User registered and logged in successfully",
      data: {
        user: {
          id: savedUser._id.toString(),
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
          onboardingCompleted: savedUser.onboardingCompleted
        },
        token: token,
        accessToken: token
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to process OAuth login",
      data: null,
      error: err.message
    });
  }
};
