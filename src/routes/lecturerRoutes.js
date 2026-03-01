const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middlewares/userMiddlewares");
const { requireRole } = require("../middlewares/roleMiddleware");
const lecturerControllers = require("../controllers/lecturerControllers");

const lecturerAuth = [ensureAuthenticated, requireRole("lecturer", "admin", "leader")];

router.get("/stats", ...lecturerAuth, lecturerControllers.getLecturerDashboardStats);
router.get("/projects", ...lecturerAuth, lecturerControllers.getLecturerProjects);
router.get("/students", ...lecturerAuth, lecturerControllers.getLecturerStudents);
router.get("/profile", ...lecturerAuth, lecturerControllers.getLecturerProfile);
router.put("/profile", ...lecturerAuth, lecturerControllers.updateLecturerProfile);

module.exports = router;
