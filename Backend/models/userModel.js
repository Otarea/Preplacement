const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "First name is required"],
      maxlength: 32,
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Last name is required"],
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//encrypt password

userSchema.pre("save", async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified("password")) {
    next();
  }

  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 10);
});

//compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

//generate a JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: 3600,
  });
};

module.exports = mongoose.model("User", userSchema);
