const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Admin details
    const name = "Super Admin";
    const email = "admin@lms.com";
    const password = "Admin@123";
    const role = "Super Admin";
    const status = "Active";

    // Check if already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      console.log(
        "Super Admin already exists with this email."
      );

      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create Super Admin
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status,
      phone: "",
      department: "Administration",
      profileImage: "",
      lastLogin: null,
    });

    console.log("");
    console.log("================================");
    console.log("Super Admin created successfully");
    console.log("================================");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Password:", password);
    console.log("Role:", user.role);
    console.log("Status:", user.status);
    console.log("================================");
    console.log("");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to create Super Admin:",
      error.message
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

createSuperAdmin();