import nodemailer from 'nodemailer';

export default class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ahmed Bahy <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD
      }
    });
  }

  async send(subject) {
    console.log('Hello From The nodemailer');
    const message = `Forgot your password? Submit a PATCH request with new password and passwordConfirm to: ${this.url}.\n
    If you didn't forget the password, Please ignore this email`;

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset() {
    await this.send('Your password reset token (valid for only 10 minutes)');
  }
}

// export default Email;
// const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
//   return {
//     body: {
//       name: username,
//       intro: 'We got a request to reset the password of our account',
//       action: {
//         instructions:
//           'To reset your password click on the following button or link:',
//         button: {
//           color: '#22BC66', // Optional action button color
//           text: 'Reset password',
//           link: passwordResetUrl
//         }
//       },
//       outro:
//         "Need help, or have questions? Just reply to this email, we'd love to help."
//     }
//   };
// };
