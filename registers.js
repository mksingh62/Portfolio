const mongoose = require("mongoose");
require("dotenv").config();

// Message schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: String,
  message: {
    type: String,
    required: true,
  },
});

// Login schema
const UserSchema2 = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
});

// Google OAuth schema
const UserSchema3 = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    required: true,
  },
  emails: String,
  photos: String,
});

module.exports = {
  Register: mongoose.model("msg", UserSchema),
  Register2: mongoose.model("Regist", UserSchema2),
  Register3: mongoose.model("Auth", UserSchema3),
};
