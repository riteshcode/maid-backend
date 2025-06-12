const cors = require("cors");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
const fileUpload = require('express-fileupload')
var cookieParser = require("cookie-parser");
var loggerMorgan = require("morgan");
const connectDB = require("./config/db");
const logger = require('./utils/logger');

// const allApiRoutes = require("./routes");

const adminRoutes = require("./admin-routes");
const customersRoutes = require("./customer-routes");

var app = express();

// Connect to MongoDB
connectDB();
require("dotenv").config();


app.use(loggerMorgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());


// Serve static files from the "public" directory
app.use("/public", express.static(path.join(__dirname, "../public")));



// ✅ Fix CORS Issues
const allowedOrigins = [
  "http://localhost:5173",
  "https://maid-hive-react.etrueconcept.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));

// // ✅ Handle Preflight Requests
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");
//   return res.sendStatus(204); // No Content
// });


// app.use("/api", allApiRoutes);
app.use("/api/admin", adminRoutes);
// routes for Customers
app.use("/api/customer",customersRoutes)

// log every api request 
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
});

module.exports = app;
