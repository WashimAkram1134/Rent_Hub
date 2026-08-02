"""
RentHub — Email Service

Sends transactional emails: verification, password reset, welcome.

In development: emails are logged to console (no SMTP needed).
In production: uses SMTP (Mailgun / SendGrid / any provider).

Email templates are inline HTML strings here.
A proper template engine (Jinja2) can be added if template complexity grows.
"""

from __future__ import annotations

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class EmailService:

    def __init__(self) -> None:
        self.from_email = settings.EMAIL_FROM
        self.from_name = settings.EMAIL_FROM_NAME
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.use_tls = settings.SMTP_USE_TLS

    # ─── Core Send ────────────────────────────────────────────────────────────

    async def send(self, *, to_email: str, subject: str, html_body: str) -> bool:
        """Send an email. Returns True on success, False on failure."""
        if settings.is_development and not self.smtp_host:
            # Dev mode: print to console instead of sending
            logger.info(
                "email_dev_mode",
                to=to_email,
                subject=subject,
                body_preview=html_body[:200],
            )
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            logger.info("email_sent", to=to_email, subject=subject)
            return True
        except Exception as exc:
            logger.error("email_send_failed", to=to_email, error=str(exc))
            return False

    # ─── Email Templates ──────────────────────────────────────────────────────

    async def send_verification_email(
        self, *, to_email: str, first_name: str, token: str
    ) -> bool:
        verify_url = f"{settings.LOCAL_STORAGE_URL.replace('/uploads', '')}/verify-email?token={token}"
        # In production, use NEXT_PUBLIC_APP_URL
        verify_url = f"http://localhost:3000/verify-email?token={token}"

        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Inter, Arial, sans-serif; background:#f8fafc; margin:0; padding:40px 20px;">
          <div style="max-width:520px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#1a3a8f,#2d4dd6); padding:32px; text-align:center;">
              <h1 style="color:white; font-size:28px; margin:0; font-weight:900;">RentHub</h1>
              <p style="color:rgba(255,255,255,0.8); margin:8px 0 0;">Verify Your Email</p>
            </div>
            <div style="padding:40px 32px;">
              <h2 style="color:#1e293b; font-size:22px; margin:0 0 16px;">Hi {first_name}! 👋</h2>
              <p style="color:#64748b; line-height:1.6; margin:0 0 24px;">
                Welcome to RentHub! Please verify your email address to activate your account
                and start renting or listing items.
              </p>
              <a href="{verify_url}"
                 style="display:inline-block; background:linear-gradient(135deg,#1a3a8f,#2d4dd6); color:white;
                        text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600;
                        font-size:16px; margin-bottom:24px;">
                Verify Email Address
              </a>
              <p style="color:#94a3b8; font-size:13px; margin:0;">
                This link expires in 24 hours. If you didn't create a RentHub account, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
        """
        return await self.send(
            to_email=to_email,
            subject="Verify your RentHub email address",
            html_body=html,
        )

    async def send_password_reset_email(
        self, *, to_email: str, first_name: str, token: str
    ) -> bool:
        reset_url = f"http://localhost:3000/reset-password?token={token}"

        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Inter, Arial, sans-serif; background:#f8fafc; margin:0; padding:40px 20px;">
          <div style="max-width:520px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#1a3a8f,#2d4dd6); padding:32px; text-align:center;">
              <h1 style="color:white; font-size:28px; margin:0; font-weight:900;">RentHub</h1>
              <p style="color:rgba(255,255,255,0.8); margin:8px 0 0;">Password Reset</p>
            </div>
            <div style="padding:40px 32px;">
              <h2 style="color:#1e293b; font-size:22px; margin:0 0 16px;">Reset your password</h2>
              <p style="color:#64748b; line-height:1.6; margin:0 0 24px;">
                Hi {first_name}, we received a request to reset your RentHub password.
                Click the button below to choose a new password.
              </p>
              <a href="{reset_url}"
                 style="display:inline-block; background:linear-gradient(135deg,#1a3a8f,#2d4dd6); color:white;
                        text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600;
                        font-size:16px; margin-bottom:24px;">
                Reset Password
              </a>
              <p style="color:#94a3b8; font-size:13px; margin:0;">
                This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                Your password will not be changed.
              </p>
            </div>
          </div>
        </body>
        </html>
        """
        return await self.send(
            to_email=to_email,
            subject="Reset your RentHub password",
            html_body=html,
        )

    async def send_welcome_email(self, *, to_email: str, first_name: str) -> bool:
        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Inter, Arial, sans-serif; background:#f8fafc; margin:0; padding:40px 20px;">
          <div style="max-width:520px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#1a3a8f,#2d4dd6); padding:32px; text-align:center;">
              <h1 style="color:white; font-size:28px; margin:0; font-weight:900;">RentHub 🎉</h1>
            </div>
            <div style="padding:40px 32px;">
              <h2 style="color:#1e293b; font-size:22px; margin:0 0 16px;">Welcome to RentHub, {first_name}!</h2>
              <p style="color:#64748b; line-height:1.6; margin:0 0 24px;">
                Your email has been verified. You're all set to start renting or listing items on Bangladesh's
                most trusted rental marketplace.
              </p>
              <a href="http://localhost:3000/search"
                 style="display:inline-block; background:linear-gradient(135deg,#1a3a8f,#2d4dd6); color:white;
                        text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600; font-size:16px;">
                Browse Listings
              </a>
            </div>
          </div>
        </body>
        </html>
        """
        return await self.send(
            to_email=to_email,
            subject=f"Welcome to RentHub, {first_name}! 🎉",
            html_body=html,
        )
