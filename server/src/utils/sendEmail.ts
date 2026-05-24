import nodeMailer from "nodemailer";
import sgMail, {MailDataRequired} from "@sendgrid/mail";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

if(!process.env.SENDGRID_API_KEY) {
  throw new Error("Please add SENDGRID_API_KEY in your .env file");
}

if(!process.env.SENDGRID_EMAIL) {
  throw new Error("Please add SENDGRID_EMAIL in your .env file");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

type Options = {
  to: string;
  subject: string;
  message: string;
};

const sendEmail = async (options: Options) => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};


type sendSendGridEmailParams = {
  to: string
  subject: string
  templateId: string
  data: any
  text: string
}

export const sendSendGridEmail = async ({
  to,
  subject,
  templateId,
  data,
  text
}: sendSendGridEmailParams) => {

  try {
    const template = await ejs.renderFile(
      path.join(__dirname, "../templates/" + templateId + ".ejs"),
      data,
      { async: true }
    );
    const msg: MailDataRequired = {
      to,
      from: {
        email: process.env.SENDGRID_EMAIL!,
        name: "Mohd Shadab",
      },
      subject,
      text,
      html: template,
    };
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
    return new Error("Email could not be sent");
  }
};

export default sendEmail;
