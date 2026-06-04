// patientId, patientName, latitude || null, longitude || null, message || 'SOS Emergency Alert'
const pool = require("../db/pool");
const { SMTPEmailSender } = require("../external/adapters/SMTPEmailSender");

const alertWorkersByEmail = async ({ patientId, patientName, latitude, longitude, message }) => {
    const allWorkers = await pool.query(`SELECT * FROM users WHERE role='worker'`);

    for(let worker of allWorkers.rows) {
        console.log(`Worker name: ${worker.name}`);

        let mailSender = new SMTPEmailSender();
        mailSender.sendEmail(process.env.SMTP_USER, worker.email, "SOS Alert", "Hi, this is an SOS alert.");
        console.log(`An email was sent to ${worker.email}`);
    }
}

module.exports = { alertWorkersByEmail };
