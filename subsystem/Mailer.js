const nodemailer = require("nodemailer");

class Mailer {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }

    async sendText(receiver, content, subject) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: this.email,
              pass: this.password
            },
            tls: {
              rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: this.email,
            to: receiver,
            subject: subject,
            text: content,
        });
    }
}

module.exports = Mailer;