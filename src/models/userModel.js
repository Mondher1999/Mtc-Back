import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    telNumber: { type: String, trim: true },

    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true },
    password: { type: String, select: false },
    role: { type: String }, // plus de enum

    dateOfBirth: { type: String, default: "" },
      gender: { type: String, default: "" },
      address: { type: String, default: "" },
      motivation: { type: String, default: "" },

      photoId: { type: String }, // File path/URL
      receipt: { type: String }, // File path/URL



     // 👇 add this field so Mongoose will store it
     id: {
      type: mongoose.Schema.Types.ObjectId,
      default: function () {
        return this._id;
      },
    },
  

    // Nouveaux champs booléens
    formValidated: { type: Boolean, default: false },   // validation formulaire
    accessValidated: { type: Boolean, default: false }, // validation accès

    // security
    passwordChangedAt: Date,
    passwordResetTokenHash: String,
    passwordResetExpiresAt: Date,

  },
  
  { timestamps: true }
);

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;   // add id field
    delete ret._id;     // hide _id
  }
});


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
