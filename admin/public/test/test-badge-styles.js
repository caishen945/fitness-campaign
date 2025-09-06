import { getBadgeClassForStatus } from '../src/shared/mappings/badgeStyles.js';

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        console.error('Assertion failed:', message, '\n  expected:', expected, '\n  actual  :', actual);
        process.exit(1);
    }
}

// Known mappings
assertEqual(getBadgeClassForStatus('commissionStatus', 'paid'), 'badge bg-success', 'commission paid');
assertEqual(getBadgeClassForStatus('commissionStatus', 'pending'), 'badge bg-warning', 'commission pending');
assertEqual(getBadgeClassForStatus('commissionStatus', 'failed'), 'badge bg-danger', 'commission failed');

// Rewards mirror commission
assertEqual(getBadgeClassForStatus('rewardStatus', 'paid'), 'badge bg-success', 'reward paid');

// Version/service
assertEqual(getBadgeClassForStatus('serviceStatus', 'running'), 'badge bg-success', 'service running');
assertEqual(getBadgeClassForStatus('versionStatus', 'current'), 'badge bg-success', 'version current');

// Unknown fallbacks
assertEqual(getBadgeClassForStatus('unknownCategory', 'x'), 'badge bg-secondary', 'unknown category fallback');
assertEqual(getBadgeClassForStatus('commissionStatus', 'unknown'), 'badge bg-secondary', 'unknown code fallback');

console.log('OK: badgeStyles basic assertions passed');

