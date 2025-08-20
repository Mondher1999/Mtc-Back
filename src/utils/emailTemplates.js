export function liveCourseEmailContent(student, course) {
    const fullName = student.firstName + " " + (student.lastName || "");
  
    // Formater la date en français
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(course.date));
  
    const text = `Bonjour ${fullName},
  
  Une nouvelle session en direct a été planifiée sur notre plateforme.
  
  Session: ${course.courseName}
  Instructeur: ${course.instructorName}
  Date: ${formattedDate}
  Heure: ${course.startTime} - ${course.endTime} (Heure locale)
  
  Merci de vous connecter à la plateforme pour accéder à la session.`;
  
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px;">
          <h2>Nouvelle session en direct: ${course.courseName}</h2>
          <p>Bonjour ${fullName},</p>
          <p>Une nouvelle session en direct a été planifiée sur notre plateforme.</p>
          <p>
            <strong>Instructeur:</strong> ${course.instructorName}<br/>
            <strong>Date:</strong> ${formattedDate}<br/>
            <strong>Heure:</strong> ${course.startTime} - ${course.endTime}
          </p>
          <p>Merci de vous connecter à la plateforme pour accéder à la session.</p>
          <p style="font-size: 12px; color: #999;">Ceci est un email automatique, merci de ne pas répondre.</p>
        </div>
      </div>
    `;
  
    return { text, html };
  }
  