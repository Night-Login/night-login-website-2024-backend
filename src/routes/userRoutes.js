const userRoutes = require("express").Router();

const { hashPassword } = require("../middlewares/userMiddlewares");

const { registerUser, loginUser } = require("../controllers/userControllers");

userRoutes.post("/register", hashPassword, registerUser);
userRoutes.post("/login", loginUser);

module.exports = userRoutes;
