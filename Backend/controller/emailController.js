// controller/emailController.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
    secure: false,
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    }
});

const EmailController = {
    sendMail: async (req, res) => {
        const emails = req.body.email;
        const data = req.body.data;
        const subject = req.body.subject;
        try {
            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: emails.join(","),
                subject: subject,
                html: data,
            };

            await transporter.sendMail(mailOptions);
            return res.json({ message: "Mail sent successfully (via Mailtrap)" });
        } catch (error) {
            console.error("Error sending email via Mailtrap:", error); // Make sure this logging is present
            res
                .status(500)
                .json({ message: "Error While Sending Mail (via Mailtrap)", error: error.message });
        }
    },
};

export default EmailController;