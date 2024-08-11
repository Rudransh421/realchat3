const express = require("express");
const router = express.Router();
const passport = require("../controler/passport");
const { connectToDB ,verificationSent, verification } = require("../controler/verify");
const User = require("../controler/signadb");
const bcrypt = require("bcryptjs");



router.post("/login", (req, res, next) => {
  console.log(req.body.email); // Log email
  console.log(req.body.password); // Log password

  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log("!user");
      console.log(info.message);
      return res.redirect("/login");
    }
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      try {
        await verificationSent(req, res, user, "login"); // Sends OTP for verification
      } catch (error) {
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    });
  })(req, res, next);
});


router.post("/verifyotp-up", async (req, res) => {
  try {
    const result = await verification(req, res);

    if (result.isOtpValid) {
      const email = req.body.email; // Extract email from req.body

      // Connect to DB and delete OTP
      const collection = await connectToDB();
      await collection.deleteOne({ email: email });

      return res.status(200).json({
        verified: true,
        message: "OTP verified successfully.",
      });
    } else {
      // If OTP is invalid, delete the user
      const email = req.body.email; // Extract email from req.body
      await User.deleteOne({ email: email });

      res.json({
        verified: false,
        message: "Invalid OTP.",
      });
    }
  } catch (err) {
    res.json({
      verified: false,
      message: "Verification process failed.",
    });
  }
});


router.post("/verifyotp-in", async (req, res) => {
  try {
    // Assuming 'verification' is a function that checks the OTP validity
    const result = await verification(req, res);

    if (result.isOtpValid) {
      const email = req.body.email; // Extract email from req.body

      // Connect to DB and delete OTP
      const collection = await connectToDB();
      await collection.deleteOne({ email: email });

      // Send a success response back to the frontend
      return res.status(200).json({
        verified: true,
        message: "OTP verified successfully.",
      });
    } else {
      // Send an error response if the OTP is invalid
      return res.status(400).json({
        verified: false,
        message: "Invalid OTP.",
      });
    }
  } catch (err) {
    // Send an error response if something went wrong during the process
    return res.status(500).json({
      verified: false,
      message: "Verification process failed.",
    });
  }
});



router.post("/signup", async (req, res) => {
  let newUser;
  try {
    const { name, email, phoneno, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    newUser = new User({
      name,
      email,
      phoneno,
      password: hashedPassword,
    });

    // Save the new user first
    await newUser.save();

    // Send the OTP
    await verificationSent(req, res, newUser, "signup");
  } catch (err) {
    console.error(err);
    if (newUser) {
      await User.deleteOne({ email: newUser.email });
    }
    res.status(500).send("Error creating user.");
  }
});



module.exports = router;