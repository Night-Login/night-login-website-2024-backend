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
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["member", "lecturer", "admin", "leader", "client"],
    default: "member"
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  // Role-specific data
  profileData: {
    // Common fields
    phone: String,
    avatar: String,
    bio: String,
    
    // Member specific
    studentId: String,
    major: String,
    university: String,
    graduationYear: Number,
    
    // Lecturer specific
    lecturerId: String,
    department: String,
    specialization: String,
    officeRoom: String,
    
    // Admin/Staff specific
    employeeId: String,
    position: String,
    department: String,
    
    // Leader specific
    title: String,
    responsibilities: [String],
    
    // Client specific
    companyName: String,
    companyWebsite: String,
    position: String,
    industry: String
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
