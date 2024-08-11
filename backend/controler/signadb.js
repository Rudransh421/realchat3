const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://Sudip:dashsudip@realchat.3jhbc.mongodb.net/?retryWrites=true&w=majority&appName=RealChat"
  )
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log("not connected mongodb ");
  });

const loginschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneno: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
});

const details = new mongoose.model("persondetails", loginschema);
module.exports = details;
