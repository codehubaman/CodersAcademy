const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587, // Use 465 for SSL, 587 for TLS
            secure: false, // Use 'true' for SSL and port 465
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })


        let info = await transporter.sendMail({
            from: `"Aman Patel" <${process.env.MAIL_USER}>`, // Use a valid email
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })
        console.log(info);
        return info;
    }
    catch (error) {
        console.log(error.message);
    }
}


module.exports = mailSender;

