import sendgrid
from sendgrid.helpers import mail
from sendgrid.helpers.mail import Email, Content, Substitution, Mail
from util import Config
# [END sendgrid-imp]
import webapp2

import logging  
import main
from handlers import base_handler

# make a secure connection to SendGrid
# [START sendgrid-config]

SENDGRID_API_KEY = Config.configs('sendgrid_api_key')
SENDGRID_SENDER = Config.configs('sendgrid_sender')
GENERIC_TEMPLATE = "3796bfc2-fa3c-46a0-b993-5bb1689b831d"
CONTENT_PLAIN = "text/plain"
CONTENT_HTML = "text/html"
DEFAULT_CTA = "Visit SCRIPTUREDIN"
DEFAULT_CTA_LINK = "https://scripturedin.appspot.com/#/"
# [END sendgrid-config]


def _send(subject, body, email_to, 
        email_from='hello@scripturedin.com', content_type=CONTENT_HTML,
        heading="", preheader="", CTA=DEFAULT_CTA, CTA_LINK=DEFAULT_CTA_LINK, template=GENERIC_TEMPLATE):
    # [START sendgrid-send]
    try:
        sg = sendgrid.SendGridAPIClient(apikey=SENDGRID_API_KEY)

        to_email = mail.Email(email_to)
        from_email = mail.Email(email_from)
        content = mail.Content(content_type, body)
        message = mail.Mail(from_email, subject, to_email, content)

        message.personalizations[0].add_substitution(Substitution("-preheader_text-", preheader))
        message.personalizations[0].add_substitution(Substitution("-heading-", heading))
        message.personalizations[0].add_substitution(Substitution("-CTA-", CTA))
        message.personalizations[0].add_substitution(Substitution("-CTA_LINK-", CTA_LINK))
        message.set_template_id(template)

        response = sg.client.mail.send.post(request_body=message.get())

        return response
    # [END sendgrid-send]
    except Exception as e:
            logging.error(e.message)


def send_welcome_email(user):
    try:
        file = open('emails/signup.html', 'r')
        body =  file.read()
        body = body.replace("-first_name-", user.first_name)

        if main._IsDevEnv() or main._IsLocalEnv():
            f = open('emails/sent/signup_email_to'+user.email, 'w+')
            f.write(body)  
            f.close()
            return True

        return _send("Welcome to SCRIPTUREDIN", body, user.email)
    except Exception as e:
            logging.error(e)




