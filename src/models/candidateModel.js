import mongoose from "mongoose";
import validator from "validator";

const candidateSchema = new mongoose.Schema(
  {
    firstName: { 
      type: String, 
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"]
    },
    
    lastName: { 
      type: String, 
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    
    email: { 
      type: String, 
      required: [true, "Email is required"],
      trim: true, 
      lowercase: true, 
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"]
    },
    
    phone: { 
      type: String, 
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function(v) {
          // Validation basique pour numéros de téléphone internationaux
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: "Please provide a valid phone number"
      }
    },
    
    specialty: { 
      type: String, 
      required: [true, "Current medical specialty is required"],
      trim: true,
      maxlength: [100, "Specialty cannot exceed 100 characters"]
    },
    
    interest: { 
      type: String, 
      trim: true,
      maxlength: [1000, "Interest description cannot exceed 1000 characters"]
    },
    
    // Statut de la candidature
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected", "waitlist"],
      default: "pending"
    },
    
    // Langue préférée basée sur le formulaire multilingue
    preferredLanguage: {
      type: String,
      enum: ["en", "fr", "zh"],
      default: "fr"
    },
    
    // Champs de suivi
    submittedAt: {
      type: Date,
      default: Date.now
    },
    
    reviewedAt: {
      type: Date
    },
    
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" // Référence à l'administrateur qui a examiné la candidature
    },
    
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"]
    },
    
    // 👇 Ajouter ce champ pour que Mongoose le stocke
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: function () {
        return this._id;
      },
    },
  },
  { 
    timestamps: true,
    // Index pour améliorer les performances de recherche
    indexes: [
      { email: 1 },
      { status: 1 },
      { submittedAt: -1 },
      { lastName: 1, firstName: 1 }
    ]
  }
);

// Configuration de la sérialisation JSON
candidateSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;   // Ajouter le champ id
    delete ret._id;     // Masquer _id
    delete ret.__v;     // Masquer __v
  }
});

// Index composé pour éviter les doublons d'email
candidateSchema.index({ email: 1 }, { unique: true });

// Middleware pre-save pour nettoyer et valider les données
candidateSchema.pre("save", function(next) {
  // Nettoyer les espaces supplémentaires
  if (this.firstName) this.firstName = this.firstName.trim();
  if (this.lastName) this.lastName = this.lastName.trim();
  if (this.specialty) this.specialty = this.specialty.trim();
  if (this.interest) this.interest = this.interest.trim();
  if (this.phone) this.phone = this.phone.replace(/\s+/g, ""); // Retirer les espaces du téléphone
  
  next();
});

// Méthode pour obtenir le nom complet
candidateSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`.trim();
};

// Méthode pour vérifier si la candidature est récente (moins de 24h)
candidateSchema.methods.isRecent = function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.submittedAt > oneDayAgo;
};

// Méthode statique pour rechercher par email
candidateSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Méthode statique pour obtenir les statistiques
candidateSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
};

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;