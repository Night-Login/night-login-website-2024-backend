const userRoutes = require("express").Router();

const { hashPassword } = require("../middlewares/userMiddlewares");

const { registerUser, loginUser, oauthLogin } = require("../controllers/userControllers");

userRoutes.post("/register", hashPassword, registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/oauth-login", oauthLogin);

module.exports = userRoutes;
