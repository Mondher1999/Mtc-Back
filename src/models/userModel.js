import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // don't return by default
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // security
    passwordChangedAt: Date,
    passwordResetTokenHash: String,
    passwordResetExpiresAt: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // update passwordChangedAt to invalidate old JWTs when password changes
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare password
userSchema.methods.correctPassword = async function (candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
};

// Check if user changed password after token was issued
userSchema.methods.changedPasswordAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  return jwtIat < changedTimestamp;
};

// Create password reset token (store hashed version)
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetTokenHash = hash;
  const mins = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MIN || 10);
  this.passwordResetExpiresAt = Date.now() + mins * 60 * 1000;

  return resetToken; // send raw token by email
};

const User = mongoose.model("User", userSchema);
export default User;
