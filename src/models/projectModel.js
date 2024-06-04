const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  projectDescription: {
    type: String,
    required: true,
  },
  projectObjective: {
    type: String,
    required: true,
  },
  projectBudget: {
    type: Number,
    required: true,
  },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;