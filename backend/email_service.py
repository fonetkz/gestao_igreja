import os
import smtplib
from email.message import EmailMessage

def send_password_reset_email(to_email: str, token: str, base_url: str = "http://localhost:5173"):
    """
    Envia o e-mail de recuperação de senha usando as configurações do arquivo .env.
    """
    # Carrega configurações
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587
        
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", "suporte@igreja.com")

    if not smtp_username or not smtp_password:
        print("Aviso: Credenciais SMTP não configuradas. O e-mail não será enviado.")
        return False

    msg = EmailMessage()
    msg['Subject'] = "Gestão Igreja - Recuperação de Senha"
    msg['From'] = from_email
    msg['To'] = to_email

    # Conteúdo HTML bem formatado
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1E2A78; text-align: center; margin-bottom: 20px;">Gestão Igreja</h2>
          <p style="color: #333333; font-size: 16px;">Olá,</p>
          <p style="color: #333333; font-size: 16px;">Recebemos uma solicitação para redefinir a senha da sua conta de administrador na plataforma Gestão Igreja.</p>
          <p style="color: #333333; font-size: 16px;">Copie o código de verificação abaixo e cole no aplicativo para criar uma nova senha:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #f4f7f6; color: #1E2A78; padding: 16px 32px; border: 1px dashed #1E2A78; border-radius: 8px; font-family: monospace; font-weight: bold; font-size: 24px; letter-spacing: 4px; display: inline-block;">
              {token}
            </span>
          </div>
          
          <p style="color: #333333; font-size: 16px; margin-top: 30px;">Se você não solicitou esta alteração, pode ignorar este e-mail. O código expirará em 1 hora.</p>
          
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
          <p style="color: #999999; font-size: 12px; text-align: center;">
            &copy; 2024 Gestão Igreja.
          </p>
        </div>
      </body>
    </html>
    """
    
    msg.set_content(f"Seu código de redefinição de senha é: {token}")
    msg.add_alternative(html_content, subtype='html')

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
        print(f"E-mail de recuperação enviado para {to_email}")
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return False

def send_email_change_code(to_email: str, token: str):
    """
    Envia o e-mail de confirmação para alteração de endereço de e-mail.
    """
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587
        
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", "suporte@igreja.com")

    if not smtp_username or not smtp_password:
        print("Aviso: Credenciais SMTP não configuradas. O e-mail não será enviado.")
        return False

    msg = EmailMessage()
    msg['Subject'] = "Gestão Igreja - Alteração de E-mail"
    msg['From'] = from_email
    msg['To'] = to_email

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1E2A78; text-align: center; margin-bottom: 20px;">Gestão Igreja</h2>
          <p style="color: #333333; font-size: 16px;">Olá,</p>
          <p style="color: #333333; font-size: 16px;">Recebemos uma solicitação para alterar o e-mail da sua conta de administrador.</p>
          <p style="color: #333333; font-size: 16px;">Copie o código de verificação abaixo e cole no aplicativo para confirmar o seu novo e-mail:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #f4f7f6; color: #1E2A78; padding: 16px 32px; border: 1px dashed #1E2A78; border-radius: 8px; font-family: monospace; font-weight: bold; font-size: 24px; letter-spacing: 4px; display: inline-block;">
              {token}
            </span>
          </div>
          
          <p style="color: #333333; font-size: 16px; margin-top: 30px;">Se você não solicitou esta alteração, ignore este e-mail.</p>
          
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
          <p style="color: #999999; font-size: 12px; text-align: center;">
            &copy; 2024 Gestão Igreja.
          </p>
        </div>
      </body>
    </html>
    """
    
    msg.set_content(f"Seu código de verificação para o novo e-mail é: {token}")
    msg.add_alternative(html_content, subtype='html')

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
        print(f"E-mail de confirmação enviado para {to_email}")
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return False
