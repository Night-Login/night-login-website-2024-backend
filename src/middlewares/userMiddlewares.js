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
  NOTES       : AuthToken can be passed through headers or cookies
*/  
exports.ensureAuthenticated = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.split(" ")[1]) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.AuthToken) {
    token = req.cookies.AuthToken;
  } else {
    return res.status(401).json({ message: "Missing authentication token!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid token"
      });
    }

    req._id = decodedToken._id;

    console.log(req._id);

    next();
  });
};
