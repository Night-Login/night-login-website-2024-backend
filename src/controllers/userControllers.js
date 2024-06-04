const User = require("../models/userModels");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/*
  DESC        : Register a new user
  PARAMS      : email, name, phoneNumber, gender, password, salt
  METHOD      : POST
  VISIBILITY  : Public
  PRE-REQ     : create hashed password and generate salt using middlewares/register.js
  RESPONSE    : -
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

  newUser
    .save()
    .then(() => {
      res.status(201).json({
        message: "User registered successfully"
      });
    })
    .catch((err) => {
      if (err.errorResponse && err.errorResponse.code === 11000) {
        return res.status(400).json({
          message: "Error! Email already exists!"
        });
      } else if (err.message && err._message == "User validation failed") {
        return res.status(409).json({
          message: "Error! Enum validation failed!"
        });
      } else {
        return res.status(500).json({
          message: "Failed to register user",
          err: err
        });
      }
    });
};

/*
  DESC        : Login user
  PARAMS      : email and password
  METHOD      : POST
  VISIBILITY  : Public
  PRE-REQ     : -
  RESPONSE    : JWT token
*/
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select("password salt")
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const hashedPassword = crypto
        .createHash("sha256")
        .update(password + user.salt)
        .digest("hex");

      if (hashedPassword !== user.password) {
        return res.status(400).json({
          message: "Invalid credentials!"
        });
      } else {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.status(200).header("Auth", token).json({
          message: "Login successful",
          token: token
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Failed to login user",
        err: err
      });
    });
};
