const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER, // Votre email
    pass: process.env.EMAIL_PASS  // Votre mot de passe d'application
  }
});

// Fonction pour envoyer l'email de réinitialisation
const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const mailOptions = {
      from: `"MonApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Réinitialisation de votre mot de passe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Réinitialisation du mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              
              <p>Ou copiez-collez ce lien dans votre navigateur :</p>
              <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all; font-size: 12px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul style="margin: 10px 0;">
                  <li>Ce lien est valable pendant <strong>1 heure</strong></li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                  <li>Ne partagez jamais ce lien avec personne</li>
                </ul>
              </div>
              
              <p>Cordialement,<br>L'équipe MonApp</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Réinitialisation de votre mot de passe
        
        Vous avez demandé à réinitialiser votre mot de passe.
        
        Cliquez sur le lien suivant pour créer un nouveau mot de passe :
        ${resetUrl}
        
        Ce lien est valable pendant 1 heure.
        
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        
        Cordialement,
        L'équipe MonApp
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error: error.message };
  }
};

// Fonction de test de la configuration email
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Serveur email prêt à envoyer des messages');
    return true;
  } catch (error) {
    console.error('❌ Erreur de configuration email:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConnection
};