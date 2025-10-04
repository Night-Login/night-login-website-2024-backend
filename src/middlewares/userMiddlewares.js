const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/*
  DESC        : Hash password
  PARAMS      : password in plain text
  NOTES       : -
*/  
exports.hashPassword = async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      message: "Password is required"
    });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");

  req.password = hashedPassword;
  req.salt = salt;

  next();
};

/*
  DESC        : Check if user is authenticated
  PARAMS      : AuthToken from JWT
  NOTES       : AuthToken can be passed through headers (Bearer format) or cookies
*/  
exports.ensureAuthenticated = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (authHeader.split(" ")[1]) {
      // Fallback for other formats
      token = authHeader.split(" ")[1];
    }
  } else if (req.cookies && req.cookies.AuthToken) {
    // Fallback to cookie
    token = req.cookies.AuthToken;
  }
  
  if (!token) {
    return res.status(401).json({ 
      status: 401,
      message: "Missing authentication token!",
      data: null
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({
        status: 403,
        message: "Invalid token",
        data: null
      });
    }

    req._id = decodedToken._id;

    console.log(req._id);

    next();
  });
};
