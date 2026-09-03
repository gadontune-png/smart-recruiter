import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from datetime import datetime

from app.core.config import settings


class EmailService:
    def __init__(
        self,
        smtp_host: str = None,
        smtp_port: int = None,
        sender_email: str = None,
        sender_name: str = None,
        smtp_username: str = None,
        smtp_password: str = None,
        smtp_use_tls: bool = None,
    ):
        self.smtp_host = smtp_host or settings.smtp_host
        self.smtp_port = smtp_port or settings.smtp_port
        self.sender_email = sender_email or settings.sender_email
        self.sender_name = sender_name or settings.sender_name
        self.smtp_username = smtp_username if smtp_username is not None else settings.smtp_username
        self.smtp_password = smtp_password if smtp_password is not None else settings.smtp_password
        self.smtp_use_tls = settings.smtp_use_tls if smtp_use_tls is None else smtp_use_tls

    def _connect(self):
        server = smtplib.SMTP(self.smtp_host, self.smtp_port)
        if self.smtp_use_tls:
            server.starttls()
        if self.smtp_username and self.smtp_password:
            server.login(self.smtp_username, self.smtp_password)
        return server

    def send_question_notification(
        self,
        recipient_email: str,
        recipient_name: str,
        assessment_title: str,
        question_text: str,
        question_type: str,
        points: int,
        deadline: Optional[str] = None,
    ) -> bool:
        try:
            msg = MIMEMultipart()
            msg["From"] = f"{self.sender_name} <{self.sender_email}>"
            msg["To"] = recipient_email
            msg["Subject"] = f"📋 New Question Assigned: {assessment_title}"

            body = self._build_question_email_body(
                recipient_name, assessment_title, question_text, question_type, points, deadline
            )
            msg.attach(MIMEText(body, "html"))

            with self._connect() as server:
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"Email send failed: {e}")
            return False

    def send_assessment_invitation(
        self,
        recipient_email: str,
        recipient_name: str,
        recruiter_name: str,
        assessment_title: str,
        invitation_link: str,
        deadline: Optional[str] = None,
    ) -> bool:
        try:
            msg = MIMEMultipart()
            msg["From"] = f"{self.sender_name} <{self.sender_email}>"
            msg["To"] = recipient_email
            msg["Subject"] = f"📝 You've Been Invited: {assessment_title}"

            body = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 3px solid #4f46e5;">
                <h1 style="color: #1a1a2e; margin: 0; font-size: 24px;">Smart Recruiter</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hello <strong>{recipient_name}</strong>,</p>
                <p style="color: #555; font-size: 14px; line-height: 1.6;">You've been invited to complete an assessment by <strong>{recruiter_name}</strong>.</p>
                <div style="background-color: #f0f0ff; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="color: #4f46e5; margin: 0 0 8px 0;">Assessment: {assessment_title}</h3>
                    <p style="color: #555; margin: 0; font-size: 13px;">
                        {"⏰ " + deadline + "<br>" if deadline else ""}
                        Please click the button below to start your assessment.
                    </p>
                </div>
                <table align="center" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                        <td style="border-radius: 6px; background-color: #4f46e5;">
                            <a href="{invitation_link}" target="_blank" style="display: inline-block; padding: 12px 30px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px;">Start Assessment</a>
                        </td>
                    </tr>
                </table>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This email was sent by Smart Recruiter on behalf of the recruiter.</p>
            </td>
        </tr>
    </table>
</body>
</html>"""
            msg.attach(MIMEText(body, "html"))

            with self._connect() as server:
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"Invitation email send failed: {e}")
            return False

    def _build_question_email_body(
        self, recipient_name: str, assessment_title: str, question_text: str, question_type: str, points: int, deadline: Optional[str]
    ) -> str:
        type_labels = {
            "multiple_choice": "Multiple Choice",
            "subjective": "Subjective",
            "coding": "Coding Challenge",
            "whiteboard": "Whiteboard Exercise",
        }
        type_label = type_labels.get(question_type, "Question")

        return f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
    <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 3px solid #4f46e5;">
                <h1 style="color: #1a1a2e; margin: 0; font-size: 24px;">📋 Smart Recruiter</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 30px;">
                <p style="color: #333; font-size: 16px;">Hello <strong>{recipient_name}</strong>,</p>
                <p style="color: #555; font-size: 14px; line-height: 1.6;">A new question has been assigned as part of the <strong>{assessment_title}</strong> assessment.</p>
                <div style="background-color: #f0f0ff; border-left: 4px solid #4f46e5; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding: 5px 0;">
                                <span style="background-color: #4f46e5; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">{type_label}</span>
                                <span style="color: #666; margin-left: 10px; font-size: 13px;">📌 {points} Points</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px 0 0 0;">
                                <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">{question_text}</p>
                            </td>
                        </tr>
                    </table>
                </div>
                {"<p style='color: #e74c3c; font-weight: bold;'>⏰ Deadline: " + deadline + "</p>" if deadline else ""}
                <p style="color: #555; font-size: 14px; line-height: 1.6;">Please complete this question before the assessment deadline.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This email was sent by Smart Recruiter. Please do not reply directly.</p>
            </td>
        </tr>
    </table>
</body>
</html>"""


class NotificationService:
    def __init__(self, email_service: Optional[EmailService] = None):
        self.email_service = email_service or EmailService()

    def send_assessment_invitation_email(
        self,
        recipient_email: str,
        recipient_name: str,
        recruiter_name: str,
        assessment_title: str,
        invitation_link: str,
        deadline: Optional[str] = None,
    ) -> bool:
        return self.email_service.send_assessment_invitation(
            recipient_email, recipient_name, recruiter_name, assessment_title, invitation_link, deadline
        )

    def send_question_assigned_email(
        self,
        recipient_email: str,
        recipient_name: str,
        assessment_title: str,
        question_text: str,
        question_type: str,
        points: int,
        deadline: Optional[str] = None,
    ) -> bool:
        return self.email_service.send_question_notification(
            recipient_email, recipient_name, assessment_title, question_text, question_type, points, deadline
        )