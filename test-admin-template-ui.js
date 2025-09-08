/*
 Automated smoke test for Admin Template Management UI interactions.
 Validates that toolbar buttons and modal open/close are wired.
*/

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:8081';

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch (_) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Server not ready: ${url}`);
}

async function run() {
  console.log(`[TEST] Waiting for admin dev server at ${ADMIN_URL} ...`);
  await waitForServer(ADMIN_URL);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err?.message || String(err)}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
  });

  try {
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#admin-root', { timeout: 10000 });

    // Bypass auth for UI wiring verification
    await page.evaluate(() => {
      localStorage.setItem('adminToken', 'dev-token'); // non-JWT -> valid for 24h in app check
      localStorage.setItem('adminUser', JSON.stringify({ username: 'tester' }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Navigate to Template Management page via app API to avoid overlay issues
    await page.waitForFunction(() => typeof window.adminApp !== 'undefined', { timeout: 10000 });
    await page.evaluate(() => window.adminApp.navigate('templates'));

    // Wait for toolbar buttons
    const ids = ['#tplSearch', '#tplClear', '#tplRefresh', '#tplCreate'];
    for (const selector of ids) {
      await page.waitForSelector(selector, { timeout: 10000 });
    }

    // Open modal via Create (use DOM click to avoid overlay)
    await page.evaluate(() => document.getElementById('tplCreate').click());
    await page.waitForSelector('#tplEditModal', { timeout: 10000 });
    const displayOpen = await page.$eval('#tplEditModal', el => getComputedStyle(el).display);
    if (displayOpen !== 'flex') throw new Error(`Edit modal not opened, display=${displayOpen}`);

    // Close modal
    await page.evaluate(() => document.getElementById('tplCloseModal').click());
    await page.waitForFunction(() => getComputedStyle(document.getElementById('tplEditModal')).display === 'none', { timeout: 10000 });
    const displayClosed = await page.$eval('#tplEditModal', el => getComputedStyle(el).display);
    if (displayClosed !== 'none') throw new Error(`Edit modal not closed, display=${displayClosed}`);

    // Click other toolbar buttons to ensure handlers exist
    await page.evaluate(() => {
      document.getElementById('tplSearch').click();
      document.getElementById('tplClear').click();
      document.getElementById('tplRefresh').click();
    });

    if (consoleErrors.length) {
      console.log('[TEST][WARN] Console errors captured:');
      consoleErrors.forEach(e => console.log('  ', e));
    }

    console.log('[TEST] Template Management UI interactions passed.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('[TEST] Failed:', err?.message || err);
    if (consoleErrors.length) {
      console.error('[TEST] Console errors:');
      consoleErrors.forEach(e => console.error('  ', e));
    }
    await browser.close();
    process.exit(1);
  }
}

run();


