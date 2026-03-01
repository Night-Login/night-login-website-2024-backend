const userRoutes = require("express").Router();

const { hashPassword, verifyCaptcha } = require("../middlewares/userMiddlewares");

const { registerUser, loginUser, oauthLogin } = require("../controllers/userControllers");

userRoutes.post("/register", verifyCaptcha, hashPassword, registerUser);
userRoutes.post("/login", verifyCaptcha, loginUser);
userRoutes.post("/oauth-login", oauthLogin);

module.exports = userRoutes;
