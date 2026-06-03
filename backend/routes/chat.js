const { Router } = require("express");
const { requireRole, authenticate } = require("../middleware/auth");
const jwt = require('jsonwebtoken');

const router = Router();

const MATRIX_JWT_SECRET = process.env.CHAT_SECRET;

router.use(authenticate);

router.get("/get-chat-token", (req, res) => {
    const { role, userId } = req.user;
    if(role != 'patient') {
        res.status(403)
            .json({
                "error": "Only patients are allowed for now"
            });
    }

    const patientUniqueId = `patient_${userId}`;

    const payload = {
        sub: patientUniqueId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 3600
    };

    console.log(`MATRIX_JWT_SECRET: ${MATRIX_JWT_SECRET}`);

    const matrixToken = jwt.sign(payload, MATRIX_JWT_SECRET, { algorithm: 'HS256' });

    res.json({
        chatToken: matrixToken
    });
});

module.exports = router;