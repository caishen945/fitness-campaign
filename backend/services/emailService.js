const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

function getTransporter() {
	if (!transporter) {
		const host = process.env.SMTP_HOST || 'localhost';
		const port = Number(process.env.SMTP_PORT || 1025);
		const secure = process.env.SMTP_SECURE === 'true';
		const user = process.env.SMTP_USER || '';
		const pass = process.env.SMTP_PASS || '';
		transporter = nodemailer.createTransport({
			host,
			port,
			secure,
			auth: user ? { user, pass } : undefined
		});
		transporter.verify().then(() => logger.info('📧 SMTP 已就绪')).catch((e) => logger.warn('⚠️ SMTP 验证失败', { error: e.message }));
	}
	return transporter;
}

async function sendMail({ to, subject, text, html }) {
	const t = getTransporter();
	const from = process.env.SMTP_FROM || 'no-reply@fitchallenge.local';
	return await t.sendMail({ from, to, subject, text, html });
}

module.exports = { sendMail };
