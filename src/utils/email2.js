import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

export const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: 'neopolitan',
    product: {
      name: 'FreeApi',
      link: 'https://freeapi.com'
    }
  });

  console.log('options.mailgenContent', options.mailgenContent);

  const emailBody = mailGenerator.generate(options.mailgenContent);
  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD
    }
  });

  // 2) Define email options
  const emailOptions = {
    from: `${process.env.EMAIL_FROM}`,
    to: options.email,
    subject: options.subject,
    html: emailBody,
    text: emailText
  };

  console.log('Hello From');
  // 3) Send Email
  try {
    await transporter.sendMail(emailOptions);
  } catch (err) {
    console.log(err);
  }
};

// 1) Email verification
export const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to FreeApi! We're very excited to have you on board.",
      action: {
        instructions: 'To verify your email, please click here:',
        button: {
          color: '#22BC66',
          text: 'Verify your email',
          link: verificationUrl
        }
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help."
    }
  };
};

export const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: 'We got a request to reset the password for your account',
      action: {
        instructions:
          'To reset your password, click on the following button or link:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Reset password',
          link: passwordResetUrl
        }
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help."
    }
  };
};
