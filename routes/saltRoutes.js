const express = require("express");
const {
  updateOrCreateSalt,
  getSalt,
} = require("../controllers/saltController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, updateOrCreateSalt);
router.route("/:id").get(protect, getSalt);

module.exports = router;
