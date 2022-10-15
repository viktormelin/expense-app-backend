const express = require("express");
const router = express.Router();

const {
  fetchGroups,
  fetchGroup,
  createGroup,
  deleteGroup,
} = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");

router.get("/fetchall", protect, fetchGroups);
router.post("/fetch", protect, fetchGroup);
router.post("/create", protect, createGroup);
router.post("/delete", protect, deleteGroup);

module.exports = router;
