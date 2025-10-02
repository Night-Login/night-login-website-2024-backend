const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
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
app.use(cors({
  origin: '*', // Replace '*' with the specific domain if you need to restrict the origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// MONGODB CONNECTION
if (!process.env.MONGO_URI) {
  throw Error("Database connection string not found");
}
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Succesfully connected to MongoDB");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB");
    console.log(err);
  });

const { apiReference } = require("@scalar/express-api-reference");

// ROUTES
app.get("/", (req, res) => {
  res.send("Night Login Website 2024 - Backend");
});
app.use("/api/v1/user", require("./src/routes/userRoutes"));
app.use("/api/v1/transaction", require("./src/routes/transactionRoutes"));

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Night Login Website 2024 - Backend API",
    version: "1.0.0",
  },
  paths: {
    "/api/v1/user/register": {
      post: {
        summary: "Register a new user",
        tags: ["User"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  name: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Error! Email already exists!" },
          409: { description: "Error! Enum validation failed!" },
          500: { description: "Failed to register user" },
        },
      },
    },
    "/api/v1/user/login": {
      post: {
        summary: "Login a user",
        tags: ["User"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          400: { description: "Invalid credentials!" },
          404: { description: "User not found" },
          500: { description: "Failed to login user" },
        },
      },
    },
    "/api/v1/transaction/create": {
      post: {
        summary: "Create a new transaction",
        tags: ["Transaction"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  projectName: { type: "string" },
                  projectDescription: { type: "string" },
                  projectObjective: { type: "string" },
                  projectBudget: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Transaction created successfully" },
          500: { description: "Failed to create transaction" },
        },
      },
    },
    "/api/v1/transaction/create-payment": {
      post: {
        summary: "Create a new payment",
        tags: ["Transaction"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  orderId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Payment created successfully" },
          404: { description: "Transaction not found" },
          500: { description: "Failed to create payment" },
        },
      },
    },
    "/api/v1/transaction/check-payment": {
      get: {
        summary: "Check a payment status",
        tags: ["Transaction"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "orderId",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: { description: "Payment success!" },
          402: { description: "Payment pending! Please complete payment!" },
          404: { description: "Transaction not found" },
          500: { description: "Failed to check payment" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
};

app.use("/reference", apiReference({ spec: { content: openApiSpec } }));

// APP START
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
