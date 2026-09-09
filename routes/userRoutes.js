const express = require("express");

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const {
  protect,
  superAdminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Both Super Admin and Admin can view users
router.get("/", protect, getUsers);

router.get("/:id", protect, getUserById);

// Only Super Admin can add users
router.post(
  "/",
  protect,
  superAdminOnly,
  createUser
);

// Only Super Admin can edit users
router.put(
  "/:id",
  protect,
  superAdminOnly,
  updateUser
);

// Only Super Admin can delete users
router.delete(
  "/:id",
  protect,
  superAdminOnly,
  deleteUser
);

module.exports = router;