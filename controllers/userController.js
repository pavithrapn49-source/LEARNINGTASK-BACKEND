const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Remove password before sending user data
const formatUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    department: user.department || "",
    profileImage: user.profileImage || "",
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin || null,
  };
};

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// CREATE USER
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      profileImage,
      role,
      status,
    } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this email already exists",
      });
    }

    // Validate role
    const allowedRoles = [
      "Super Admin",
      "Admin",
      "Teacher",
      "Student",
    ];

    if (
      role &&
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        message: "Invalid user role",
      });
    }

    // Validate status
    const allowedStatuses = [
      "Active",
      "Inactive",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid user status",
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
      department: department || "",
      profileImage: profileImage || "",
      role: role || "Student",
      status: status || "Active",
      lastLogin: null,
    });

    res.status(201).json({
      message: "User created successfully",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "User with this email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      profileImage,
      role,
      status,
    } = req.body;

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Validate role
    const allowedRoles = [
      "Super Admin",
      "Admin",
      "Teacher",
      "Student",
    ];

    if (
      role &&
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        message: "Invalid user role",
      });
    }

    // Validate status
    const allowedStatuses = [
      "Active",
      "Inactive",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid user status",
      });
    }

    // Check duplicate email
    if (
      email &&
      email.toLowerCase().trim() !==
        user.email
    ) {
      const existingUser =
        await User.findOne({
          email: email.toLowerCase().trim(),
          _id: { $ne: user._id },
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "Another user already has this email",
        });
      }
    }

    // Update fields
    if (name !== undefined) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      user.email =
        email.toLowerCase().trim();
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (department !== undefined) {
      user.department = department;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (status !== undefined) {
      user.status = status;
    }

    // Change password only when supplied
    if (password) {
      user.password =
        await bcrypt.hash(password, 10);
    }

    const updatedUser =
      await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: formatUser(updatedUser),
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Another user already has this email",
      });
    }

    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};