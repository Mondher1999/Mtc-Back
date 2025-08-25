// src/controllers/authController.js
import crypto from "crypto";
import User from "../models/userModel.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendEmail } from "../utils/sendEmail.js";
import { defaultUserEmailContent,enseignantEmailContent } from "../utils/emailTemplates.js";

/**
 * Helper: shape user for client
 */
export const sanitizeUser = (user) => {
  return {
    id: user._id.toString(),
    firstName: user.firstName,      // 🔹 Ajouter
    lastName: user.lastName,        // 🔹 Ajouter
    name: user.name,
    email: user.email,
    role: user.role,
    formValidated: user.formValidated,
    accessValidated: user.accessValidated,
    telNumber: user.telNumber || null,
    address: user.address || null,
    dateOfBirth: user.dateOfBirth || null,
    gender: user.gender || null,
    motivation: user.motivation || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    photoId: user.photoId,
    receipt: user.receipt,
  }
}


/**
 * Helper: set refresh token cookie with env-aware options
 * - In dev: SameSite=Lax, secure=false works on http://localhost
 * - In prod (HTTPS, possibly different domain): SameSite=None, secure=true
 */
const setRefreshCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,                     // cookie only over HTTPS in prod
    sameSite: isProd ? "none" : "lax",  // cross-site requires "none" in prod
    path: "/auth/refresh",              // cookie is sent only to this path
    maxAge: parseInt(process.env.JWT_REFRESH_MAX_AGE_MS || "", 10) || 7 * 24 * 60 * 60 * 1000, // default 7d
  });
};

/**
 * POST /auth/register
 * - Automatically generates a password
 * - Sends it by email to the user
 */
export const getStudentsVerified = async (req, res) => {
  try {
    const students = await User.find({
      role: "etudiant",
      formValidated: true,
      accessValidated: true,
    }).select("-password -passwordResetTokenHash -passwordResetExpiresAt");

    res.json({ count: students.length, students });
  } catch (err) {
    console.error("getStudentsVerified error:", err);
    res.status(500).json({ error: "Could not fetch verified students" });
  }
};

export const validateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { formValidated: true, accessValidated: true },
      { new: true, runValidators: true }
    ).select("-password -passwordResetTokenHash -passwordResetExpiresAt");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User validated successfully",
      user,
    });
  } catch (err) {
    console.error("validateUser error:", err);
    res.status(500).json({ error: "Could not validate user" });
  }
};


export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "enseignant",
    }).select("-password -passwordResetTokenHash -passwordResetExpiresAt");

    res.json({ count: teachers.length, teachers });
  } catch (err) {
    console.error("getTeachers error:", err);
    res.status(500).json({ error: "Could not fetch teachers" });
  }
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, telNumber, email, role } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "firstName, lastName and email are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    // Generate random password
    const generatedPassword = crypto.randomBytes(6).toString("hex");

    // Définir formValidated et accessValidated selon le rôle
    let formValidated = false;
    let accessValidated = false;
    if (role === "enseignant" || role === "admin") {
      formValidated = true;
      accessValidated = true;
    }

    const user = await User.create({
      firstName,
      lastName,
      telNumber,
      email,
      role,
      name: `${firstName} ${lastName}`,
      password: generatedPassword,
      formValidated,
      accessValidated,

    });

    user.userId = user._id;
await user.save();


      let emailContent;
      if (role === "enseignant") {
        emailContent = enseignantEmailContent(user, generatedPassword);
      } else {
        emailContent = defaultUserEmailContent(user, generatedPassword);
      }

      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
          

    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// 🔹 1️⃣ Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -passwordResetTokenHash -passwordResetExpiresAt");
    const sanitizedUsers = users.map(sanitizeUser);
    res.json({ count: sanitizedUsers.length, users: sanitizedUsers });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ error: "Could not fetch users" });
  }
};

// 🔹 2️⃣ Fetch only students
export const getStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "etudiant",
      // Exclure uniquement les docs où formValidated ∈ {false,"false",0}
      // ET accessValidated ∈ {false,"false",0} (les deux à la fois)
      $nor: [
        {
          $and: [
            { formValidated: { $in: [false, "false", 0, "0"] } },
            { accessValidated: { $in: [false, "false", 0, "0"] } },
          ],
        },
      ],
    })
      .select("-password -passwordResetTokenHash -passwordResetExpiresAt")
      .lean();

    const sanitizedStudents = students.map(sanitizeUser);
    res.json({ count: sanitizedStudents.length, students: sanitizedStudents });
  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ error: "Could not fetch students" });
  }
};
;




export const getStudentsNotVerified = async (req, res) => {
  try {
    const students = await User.find({
      role: "etudiant",
   
    }).select("-password -passwordResetTokenHash -passwordResetExpiresAt");

    const sanitizedStudents = students.map(sanitizeUser);
    res.json({ count: sanitizedStudents.length, students: sanitizedStudents });
  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ error: "Could not fetch students" });
  }
};

export const validateUserAccess = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update access validation status
    user.accessValidated = true;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "🎉 Inscription validée - Accès autorisé",
      text: `Bonjour ${user.firstName || user.name},\n\nFélicitations ! Votre inscription a été validée et vous pouvez maintenant accéder à la plateforme.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e; margin: 0;">🎉 Inscription Validée !</h1>
            </div>
            
            <h2 style="color: #333;">Bonjour ${user.firstName || user.name},</h2>
            
            <div style="background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #166534; font-weight: bold;">
                ✅ Félicitations ! Votre inscription a été validée avec succès.
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Nous avons le plaisir de vous confirmer que votre dossier d'inscription a été examiné et approuvé par notre équipe.
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              <strong>Vous pouvez maintenant accéder à la plateforme</strong> avec vos identifiants de connexion.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000/'}/auth" 
                 style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Se connecter à la plateforme
              </a>
            </div>
            
            <hr style="border: none; height: 1px; background-color: #e5e5e5; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px;">
              Si vous avez des questions, n'hésitez pas à nous contacter à l'adresse : 
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Merci de votre confiance,<br/>
                <strong style="color: #333;">L'équipe de la plateforme</strong>
              </p>
            </div>
          </div>
        </div>
      `
    });

    return res.status(200).json({
      message: "User access validated successfully. Confirmation email sent.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        accessValidated: user.accessValidated,
      }
    });

  } catch (err) {
    console.error("User validation error:", err);
    return res.status(500).json({ error: "User validation failed" });
  }
};




export const registerForm = async (req, res) => {
  try {
    console.log("🚀 registerForm started");

    const { id } = req.params;
    const { email, dateOfBirth, gender, address, motivation } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      console.log("❌ User not found with ID:", id);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User found:", { id: user._id, email: user.email, name: user.name });

    // Handle file uploads
    if (req.files) {
      if (req.files.receipt?.[0]) {
        user.receipt = `/uploads/${req.files.receipt[0].filename}`;
        console.log("💳 Receipt uploaded:", user.receipt);
      }
      if (req.files.photoId?.[0]) {
        user.photoId = `/uploads/${req.files.photoId[0].filename}`;
        console.log("🆔 Photo ID uploaded:", user.photoId);
      }
    }

    // Update user data
    user.email = email || user.email;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.gender = gender || user.gender;
    user.address = address || user.address;
    user.motivation = motivation || user.motivation;

    // Mark form as completed
    user.formValidated = true;
    user.accessValidated = false;

    await user.save();
    console.log("✅ User saved successfully");

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Confirmation de votre inscription",
      text: `Bonjour ${user.firstName || user.name},\n\nVotre formulaire est bien reçu et en attente de validation.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Bonjour ${user.firstName || user.name},</h2>
          <p>Nous avons bien reçu vos informations d'inscription ainsi que vos documents.</p>
          <p>✅ Votre dossier est maintenant en attente de validation par notre équipe.</p>
          <p>Vous recevrez un email de confirmation une fois que votre inscription aura été validée.</p>
          <br/>
          <p>Merci de votre confiance,<br/><strong>L'équipe de la plateforme</strong></p>
        </div>
      `
    });
    console.log("📧 Confirmation email sent");

    // Generate tokens
    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });
    setRefreshCookie(res, refreshToken);
    console.log("🔐 Tokens generated");

    return res.status(200).json({
      message: "Registration data updated successfully. Confirmation email sent.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        motivation: user.motivation,
        receiptUrl: user.receiptUrl || null,
        photoIdUrl: user.photoIdUrl || null,
        formValidated: user.formValidated,
        accessValidated: user.accessValidated,
      },
      accessToken,
    });
  } catch (err) {
    console.error("❌ registerForm error:", err);
    return res.status(500).json({ error: "Registration update failed" });
  }
};


/**
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const correct = await user.correctPassword(password, user.password);
    if (!correct) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });

    setRefreshCookie(res, refreshToken);

    return res.json({
      accessToken,
      user: sanitizeUser(user), // 👈 inclut maintenant role, formValidated, accessValidated
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};


/**
 * POST /auth/refresh
 * - Reads refresh token from cookie
 * - Rotates refresh token
 * - Returns new access token
 */
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Rotate tokens
    const newAccess = signAccessToken({ id: user._id });
    const newRefresh = signRefreshToken({ id: user._id });

    setRefreshCookie(res, newRefresh);

    // Return ONLY the access token
    res.json({ accessToken: newAccess });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

/**
 * POST /auth/logout
 * - Clears refresh cookie
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/auth/refresh",
    });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};

/**
 * GET /auth/me (protected)
 * - Return the user object directly to match frontend: setUser(res.data)
 */
export const me = async (req, res) => {
  res.json(sanitizeUser(req.user));
};

/**
 * PATCH /auth/update-password (protected)
 * - Issues fresh access token + rotates refresh token
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both currentPassword and newPassword are required" });

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const correct = await user.correctPassword(currentPassword, user.password);
    if (!correct) return res.status(401).json({ error: "Current password incorrect" });

    user.password = newPassword;
    await user.save();

    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });
    setRefreshCookie(res, refreshToken);

    res.json({
      message: "Password updated",
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not update password" });
  }
};

/**
 * POST /auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const user = await User.findOne({ email });
    if (!user) {
      // For privacy, respond the same even if not found
      return res.json({ message: "If that email exists, a reset link was sent" });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Instructions",
      text: `Reset your password using this link (valid for a short time): ${resetURL}`,
      html: `<p>Reset your password using this link (valid for a short time):</p><p><a href="${resetURL}">${resetURL}</a></p>`,
    });

    res.json({ message: "If that email exists, a reset link was sent" });
  } catch (err) {
    res.status(500).json({ error: "Could not send reset email" });
  }
};

/**
 * POST /auth/reset-password
 * - Issues fresh access token + rotates refresh token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword)
      return res.status(400).json({ error: "token, email, newPassword required" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: Date.now() },
    }).select("+password");

    if (!user) return res.status(400).json({ error: "Token invalid or expired" });

    user.password = newPassword;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id });
    setRefreshCookie(res, refreshToken);

    res.json({
      message: "Password reset successful",
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not reset password" });
  }
};
