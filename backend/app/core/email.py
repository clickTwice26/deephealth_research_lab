from typing import List
import logging

# Simple mock email sender
# In a real app, integrate with smtplib, SendGrid, AWS SES, etc.

async def send_email(to_emails: List[str], subject: str, message: str):
    """
    Mock sending an email to a list of recipients.
    """
    logging.info(f"--- MOCK EMAIL SENDING ---")
    logging.info(f"Subject: {subject}")
    logging.info(f"To: {', '.join(to_emails)}")
    logging.info(f"Body: {message}")
    logging.info(f"--------------------------")
    
    # Simulate success
    return True
