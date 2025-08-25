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
  

  // Fonction pour générer le contenu de l'email pour l'instructeur
  export const liveCourseInstructorEmailContent = (instructor, course) => {
    const text = `
  您好 ${instructor.name}，
  
  您是以下直播课程的讲师：
  
  课程名称：${course.courseName}
  课程描述：${course.description || "无描述"}
  日期：中国时间 ${new Date(course.date).toLocaleDateString("zh-CN")}
  时间：中国时间 (UTC+8) ${course.startTimeChina} - ${course.endTimeChina}
  加入课程链接：${course.meetingLink}
  
  请准备好课程内容，并在必要时联系您的学生。
  
  此致敬礼，
  培训团队
    `;
  
    const html = `
  <html>
    <body>
      <p>您好 <strong>${instructor.name}</strong>，</p>
      <p>您是以下直播课程的讲师：</p>
      <ul>
        <li><strong>课程名称：</strong> ${course.courseName}</li>
        <li><strong>课程描述：</strong> ${course.description || "无描述"}</li>
        <li><strong>日期：</strong> 中国时间 ${new Date(course.date).toLocaleDateString("zh-CN")}</li>
        <li><strong>时间：</strong> 中国时间 (UTC+8) ${course.startTimeChina} - ${course.endTimeChina}</li>
      </ul>
      <p>请准备好课程内容，并在必要时联系您的学生。</p>
      <p>此致敬礼，<br/>培训团队</p>
    </body>
  </html>
    `;
  
    return { text, html };
  };
  

  // 📧 Email pour les utilisateurs par défaut (français)
export function defaultUserEmailContent(user, generatedPassword) {
  const text = `
Bonjour ${user.name},

Nous sommes ravis de vous accueillir sur notre plateforme !

Votre compte a été créé avec succès. Voici vos identifiants :

Email : ${user.email}
Mot de passe : ${generatedPassword}

Merci de votre confiance,
L'équipe de la plateforme
  `;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
      <h2 style="color: #2F80ED; font-size: 24px; margin-bottom: 20px;">Bienvenue ${user.name} ! 🎉</h2>
      <p style="font-size: 16px; color: #333333; line-height: 1.5;">
        Nous sommes ravis de vous accueillir sur notre plateforme. Votre compte a été créé avec succès.
      </p>
      
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="font-weight: bold; padding: 8px; background-color: #f2f2f2; width: 120px;">Email :</td>
          <td style="padding: 8px;">${user.email}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 8px; background-color: #f2f2f2;">Mot de passe :</td>
          <td style="padding: 8px;">${generatedPassword}</td>
        </tr>
      </table>

      <p style="font-size: 16px; color: #333333; line-height: 1.5;">
        Nous vous invitons à vous connecter dès maintenant pour découvrir nos ressources.
      </p>

     <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth" 
   style="display: inline-block; 
          padding: 12px 20px; 
          margin: 20px 0; 
          background-color: #2F80ED; 
          color: #fff; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: bold;">
  Se connecter à la plateforme
</a>


      <p style="font-size: 16px; color: #333333;">
        Merci de votre confiance,<br/>
        <strong>L'équipe de la plateforme</strong>
      </p>

      <p style="margin-top: 30px; font-size: 12px; color: #999;">
        Ceci est un email automatique, merci de ne pas répondre.
      </p>
    </div>
  </div>
  `;

  return { subject: "Bienvenue sur notre plateforme !", text, html };
}

// 📧 Email spécifique pour les enseignants (chinois)
export function enseignantEmailContent(user, generatedPassword) {
  const text = `
尊敬的 ${user.name} 老师，您好！

我们非常高兴地欢迎您加入我们的平台！

您的账号已成功创建，以下是您的登录信息：

邮箱：${user.email}
密码：${generatedPassword}

请立即登录并开始探索我们为您准备的资源。祝您在平台上有愉快的体验！

感谢您的信任，
平台团队
  `;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
      <h2 style="color: #2F80ED; font-size: 24px; margin-bottom: 20px;">欢迎 ${user.name} 老师！ 🎉</h2>
      <p style="font-size: 16px; color: #333333; line-height: 1.5;">
        我们非常高兴地欢迎您加入我们的平台，您的账号已成功创建。
      </p>
      
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="font-weight: bold; padding: 8px; background-color: #f2f2f2; width: 120px;">邮箱：</td>
          <td style="padding: 8px;">${user.email}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; padding: 8px; background-color: #f2f2f2;">密码：</td>
          <td style="padding: 8px;">${generatedPassword}</td>
        </tr>
      </table>

      <p style="font-size: 16px; color: #333333; line-height: 1.5;">
        请立即登录，开始您的体验，探索我们平台提供的一切资源。
      </p>

      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth" 
        style="display: inline-block; 
                padding: 12px 20px; 
                margin: 20px 0; 
                background-color: #2F80ED; 
                color: #fff; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: bold;">
        登录平台
      </a>


      <p style="font-size: 16px; color: #333333;">
        感谢您的信任，<br/>
        <strong>平台团队</strong>
      </p>

      <p style="margin-top: 30px; font-size: 12px; color: #999;">
        此邮件为自动发送，请勿回复。
      </p>
    </div>
  </div>
  `;

  return { subject: "欢迎加入我们的平台！", text, html };
}
