export function generateResetPasswordEmail(passwordLink: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Réinitialisation du mot de passe</title>
    </head>
    <body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif; background-color:#1a1b3a; color:white;">
      <div style="max-width:600px; margin:0 auto; background-color:#1a1b3a; min-height:100%;">
    
        <div style="padding:20px 40px; text-align:center;">
          <h1 style="font-size:32px; font-weight:bold; margin:30px 0 20px; line-height:1.2; color:white;">
            Réinitialiser votre mot de passe <span style="color:#a855f7;">Dubai Launchers</span>
          </h1>
    
          <p style="font-size:16px; color:white; margin-bottom:40px; line-height:1.6;">
            Vous avez demandé à réinitialiser votre mot de passe Dubai Launchers.
          </p>
    
          <a href="${passwordLink}" style="display:inline-block; background:linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color:white; text-decoration:none; padding:16px 32px; border-radius:12px; font-weight:600; font-size:16px; margin:20px 0; box-shadow:0 4px 15px rgba(168,85,247,0.3);">
            Réinitialiser <span style="margin-left:8px;">→</span>
          </a>
    
          <p style="font-size:14px; color:#94a3b8; margin-top:30px;">
            Ce lien va expirer dans 24h.
          </p>
        </div>
    
        <div style="padding:40px 20px 20px; text-align:center; border-top:1px solid rgba(255,255,255,0.1); margin-top:40px;">
          <p style="font-size:14px; color:#94a3b8; margin-bottom:10px;">
            © 2025 Dubai Launchers. All rights reserved.<br>
            Dubai, United Arab Emirates
          </p>
        </div>
      </div>
    </body>
    </html>`;
}
