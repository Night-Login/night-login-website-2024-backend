const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();

// DOTENV CONFIG
dotenv.config();

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));

// CORS
app.use(cors());

// ROUTES
app.get("/", (req, res) => {
  res.send("Night Login Website 2024 - Backend");
});

// APP START
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});