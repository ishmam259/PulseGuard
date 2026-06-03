import nodemailer from 'nodemailer';
import { IEmailSender } from "../../interfaces/emailSender.js"; // Note: standard JS often requires the .js extension

export class SMTPEmailSender extends IEmailSender {
    constructor() {
        super(); // Required in JS when extending another class
        
        // Initializes the SMTP transporter using environment variables
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for others
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Sends an email using the configured SMTP transport.
     */
    async sendEmail(from, to, subject, body) {
        try {
            const mailOptions = {
                from: from,
                to: to,
                subject: subject,
                html: body, // Changes to 'text: body' if you aren't sending HTML
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent successfully. Message ID: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error('Failed to send email via SMTP:', error);
            throw error;
        }
    }
}