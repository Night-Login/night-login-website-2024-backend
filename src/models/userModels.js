const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true
  },
  gender: {
    type: String,
    enum: ["LAKI-LAKI", "PEREMPUAN"],
    required: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
