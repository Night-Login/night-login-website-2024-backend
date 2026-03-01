const mongoose = require("mongoose");

const talentPoolSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },
  role: {
    type: String,
    required: true
  },
  batch: {
    type: String
  },
  educationLevel: {
    type: String,
    enum: ["bachelors", "masters", "phd", "diploma", "other"]
  },
  isCertified: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  skills: [{
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["frontend", "backend", "mobile", "ai-ml", "design", "devops", "other"]
    }
  }],
  description: {
    type: String
  },
  email: {
    type: String
  },
  linkedin: {
    type: String
  },
  github: {
    type: String
  },
  portfolio: {
    type: String
  }
}, {
  timestamps: true
});

const TalentPool = mongoose.model("TalentPool", talentPoolSchema);

module.exports = TalentPool;
