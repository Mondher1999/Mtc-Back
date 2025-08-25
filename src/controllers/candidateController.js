import Candidate from "../models/candidateModel.js"; // Ajustez le chemin selon votre structure
import { sendEmail } from "../utils/sendEmail.js"; // Ajustez selon votre utilitaire d'email

export const registerCandidate = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, specialty, interest, preferredLanguage } = req.body;

    // Validation des champs requis
    if (!firstName || !lastName || !email || !phone || !specialty) {
      return res.status(400).json({ 
        error: "firstName, lastName, email, phone and specialty are required" 
      });
    }

    // Vérifier si l'email existe déjà
    const existingCandidate = await Candidate.findByEmail(email);
    if (existingCandidate) {
      return res.status(409).json({ 
        error: "A candidate with this email already exists" 
      });
    }

    // Créer la nouvelle candidature
    const candidate = await Candidate.create({
      firstName,
      lastName,
      email,
      phone,
      specialty,
      interest: interest || "",
      preferredLanguage: preferredLanguage || "fr",
      status: "pending"
    });

    // Préparer le contenu de l'email pour l'administrateur
    const adminEmailContent = createAdminNotificationEmail(candidate);
    
    // Envoyer l'email à l'administrateur
    const adminEmail = process.env.ADMIN_EMAIL || "admin@tcm-formation.com";
    await sendEmail({
      to: adminEmail,
      subject: adminEmailContent.subject,
      text: adminEmailContent.text,
      html: adminEmailContent.html,
    });

    // Préparer le contenu de l'email de confirmation pour le candidat
    const confirmationEmailContent = createCandidateConfirmationEmail(candidate);
    
    // Envoyer l'email de confirmation au candidat
    await sendEmail({
      to: candidate.email,
      subject: confirmationEmailContent.subject,
      text: confirmationEmailContent.text,
      html: confirmationEmailContent.html,
    });

    // Répondre avec succès (sans token ni données sensibles)
    res.status(201).json({
      message: "Candidature soumise avec succès",
      candidateId: candidate.id,
      status: candidate.status
    });

  } catch (err) {
    console.error("Register candidate error:", err);
    
    // Gestion d'erreurs spécifiques
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors 
      });
    }

    res.status(500).json({ 
      error: "Registration failed. Please try again later." 
    });
  }
};

// Fonction pour créer le contenu de l'email administrateur
const createAdminNotificationEmail = (candidate) => {
  const subject = `🎓 Nouvelle candidature MTC - ${candidate.getFullName()}`;
  
  const text = `
Nouvelle candidature reçue pour la formation MTC

Détails du candidat:
- Nom: ${candidate.getFullName()}
- Email: ${candidate.email}
- Téléphone: ${candidate.phone}
- Spécialité: ${candidate.specialty}
- Langue préférée: ${candidate.preferredLanguage}
- Date de soumission: ${candidate.submittedAt.toLocaleDateString('fr-FR')}

${candidate.interest ? `Motivation:\n${candidate.interest}` : 'Aucune motivation spécifiée.'}

Connectez-vous à l'administration pour examiner cette candidature.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🎓 Nouvelle Candidature MTC</h1>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #dc2626;">Détails du candidat</h2>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p><strong>Nom:</strong> ${candidate.getFullName()}</p>
          <p><strong>Email:</strong> <a href="mailto:${candidate.email}">${candidate.email}</a></p>
          <p><strong>Téléphone:</strong> <a href="tel:${candidate.phone}">${candidate.phone}</a></p>
          <p><strong>Spécialité médicale:</strong> ${candidate.specialty}</p>
          <p><strong>Langue préférée:</strong> ${candidate.preferredLanguage.toUpperCase()}</p>
          <p><strong>Date de soumission:</strong> ${candidate.submittedAt.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        ${candidate.interest ? `
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Motivation du candidat:</h3>
          <p style="font-style: italic;">${candidate.interest}</p>
        </div>
        ` : ''}
        
      
      </div>
      
      <div style="text-align: center; padding: 15px; color: #666; font-size: 12px;">
        <p>Formation MTC - Système de gestion des candidatures</p>
      </div>
    </div>
  `;

  return { subject, text, html };
};

// Fonction pour créer le contenu de l'email de confirmation candidat
const createCandidateConfirmationEmail = (candidate) => {
  const translations = {
    fr: {
      subject: "✅ Candidature reçue - Formation MTC",
      greeting: `Bonjour ${candidate.firstName},`,
      confirmation: "Nous avons bien reçu votre candidature pour notre formation en Médecine Traditionnelle Chinoise.",
      details: "Détails de votre candidature:",
      nextSteps: "Prochaines étapes:",
      step1: "• Notre équipe va examiner votre candidature",
      step2: "• Vous recevrez une réponse sous 3-5 jours ouvrables",
      step3: "• En cas d'acceptation, nous vous enverrons les détails d'inscription",
      contact: "Si vous avez des questions, n'hésitez pas à nous contacter.",
      thanks: "Merci pour votre intérêt !",
      team: "L'équipe Formation MTC"
    },
    en: {
      subject: "✅ Application Received - MTC Training",
      greeting: `Hello ${candidate.firstName},`,
      confirmation: "We have received your application for our Traditional Chinese Medicine training program.",
      details: "Your application details:",
      nextSteps: "Next steps:",
      step1: "• Our team will review your application",
      step2: "• You will receive a response within 3-5 business days",
      step3: "• If accepted, we will send you enrollment details",
      contact: "If you have any questions, please don't hesitate to contact us.",
      thanks: "Thank you for your interest!",
      team: "MTC Training Team"
    },
    zh: {
      subject: "✅ 申请已收到 - 中医培训",
      greeting: `您好 ${candidate.firstName},`,
      confirmation: "我们已收到您的中医培训项目申请。",
      details: "您的申请详情：",
      nextSteps: "后续步骤：",
      step1: "• 我们的团队将审核您的申请",
      step2: "• 您将在3-5个工作日内收到回复",
      step3: "• 如果被录取，我们将发送注册详情",
      contact: "如有任何问题，请随时联系我们。",
      thanks: "感谢您的关注！",
      team: "中医培训团队"
    }
  };

  const lang = candidate.preferredLanguage || 'fr';
  const t = translations[lang] || translations.fr;

  const text = `
${t.greeting}

${t.confirmation}

${t.details}
- ${candidate.getFullName()}
- ${candidate.email}
- ${candidate.specialty}

${t.nextSteps}
${t.step1}
${t.step2}
${t.step3}

${t.contact}

${t.thanks}
${t.team}
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">✅ ${t.subject.split(' - ')[1]}</h1>
      </div>
      
      <div style="padding: 20px;">
        <p style="font-size: 16px;">${t.greeting}</p>
        
        <p>${t.confirmation}</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">${t.details}</h3>
          <p><strong>Nom:</strong> ${candidate.getFullName()}</p>
          <p><strong>Email:</strong> ${candidate.email}</p>
          <p><strong>Spécialité:</strong> ${candidate.specialty}</p>
        </div>

        <h3 style="color: #dc2626;">${t.nextSteps}</h3>
        <ul style="color: #555;">
          <li>${t.step1.substring(2)}</li>
          <li>${t.step2.substring(2)}</li>
          <li>${t.step3.substring(2)}</li>
        </ul>

        <p>${t.contact}</p>
        
        <p style="margin-top: 30px;"><strong>${t.thanks}</strong><br>
        ${t.team}</p>
      </div>
      
      <div style="text-align: center; padding: 15px; color: #666; font-size: 12px; border-top: 1px solid #eee;">
        <p>Formation MTC © ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  return { subject: t.subject, text, html };
};