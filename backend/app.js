const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("./controler/passport");
const path = require("path");
const connectDB = require("./controler/signadb");
const cors = require("cors");
const app = express();

// Connect to the database
try {
  connectDB();
} catch (err) {
  console.log("Database connection failed: ", err);
}

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// CORS setup
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your React frontend domain
    methods: "GET,POST", // Specify allowed methods
    credentials: true, // Enable cookies/session data
  })
);

// Serve React app's static files
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

// API Routes
const indexRouter = require("./src/index");
app.use("/api", indexRouter);

// Serve React App on any unmatched route
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
