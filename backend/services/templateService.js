const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Template selection and rendering service
 * - Selection rule: template_key + locale + channel, pick latest active version
 * - Language fallback order: userLang -> en-US -> zh-CN
 * - Variable rendering: replace {var} with provided values (shallow), unknown kept as-is
 * - Supported channels: 'web' | 'email' | 'telegram' | 'push' | 'sms'
 */

function buildLanguageCandidates(preferredLanguage) {
    const candidates = [];
    if (preferredLanguage && typeof preferredLanguage === 'string') {
        candidates.push(preferredLanguage);
    }
    if (!candidates.includes('en-US')) candidates.push('en-US');
    if (!candidates.includes('zh-CN')) candidates.push('zh-CN');
    return candidates;
}

async function fetchLatestActiveTemplate(templateKey, locale, channel) {
    const [rows] = await pool.query(
        `SELECT id, template_key, locale, channel, version, name, subject, body, is_active, created_at, updated_at
         FROM notification_templates
         WHERE template_key = ? AND locale = ? AND channel = ? AND is_active = 1
         ORDER BY version DESC
         LIMIT 1`,
        [templateKey, locale, channel]
    );
    return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Resolve a template by key/language/channel with fallback
 * @param {Object} params
 * @param {string} params.templateKey
 * @param {string} [params.language]
 * @param {('web'|'email'|'telegram'|'push'|'sms')} [params.channel='web']
 * @returns {Promise<null|Object>} template row or null
 */
async function resolveTemplate({ templateKey, language, channel = 'web' }) {
    if (!templateKey) return null;
    const locales = buildLanguageCandidates(language);

    for (const locale of locales) {
        try {
            const row = await fetchLatestActiveTemplate(templateKey, locale, channel);
            if (row) return row;
        } catch (e) {
            logger.warn('Failed to fetch template candidate', { templateKey, locale, channel, error: e.message });
        }
    }
    return null;
}

function coerceToString(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
        try { return JSON.stringify(value); } catch (_) { return String(value); }
    }
    return String(value);
}

/**
 * Render a text with {variable} placeholders
 * @param {Object} params
 * @param {string} params.text
 * @param {Record<string, any>} [params.variables]
 * @returns {string}
 */
function renderText({ text, variables = {} }) {
    if (!text || typeof text !== 'string') return '';
    if (!variables || typeof variables !== 'object') return text;
    return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, varName) => {
        if (Object.prototype.hasOwnProperty.call(variables, varName)) {
            return coerceToString(variables[varName]);
        }
        return match; // keep unknown placeholder as-is
    });
}

/**
 * Render subject/body pair
 * @param {Object} params
 * @param {string|null} params.subject
 * @param {string} params.body
 * @param {Record<string, any>} [params.variables]
 * @returns {{ subject: string|null, body: string }}
 */
function renderMessage({ subject, body, variables = {} }) {
    const renderedSubject = subject == null ? null : renderText({ text: subject, variables });
    const renderedBody = renderText({ text: body || '', variables });
    return { subject: renderedSubject, body: renderedBody };
}

module.exports = {
    resolveTemplate,
    renderText,
    renderMessage
};


