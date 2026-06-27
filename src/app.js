const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const routes = require("./routes");

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.use("/api", routes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server Running"
  });
});


const path = require("path");

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

module.exports = app;