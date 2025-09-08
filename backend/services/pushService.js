const { normalizeBoolean } = require('../config/featureFlags');

function isEnabled() {
    return normalizeBoolean(process.env.PUSH_ENABLED);
}

async function send({ to, title, body, data = {} }) {
    if (!isEnabled()) {
        throw new Error('PUSH_DISABLED');
    }
    // Placeholder implementation: integrate FCM/APNs in future
    // For now, just simulate success to maintain interface parity
    return { success: true };
}

module.exports = { isEnabled, send };


