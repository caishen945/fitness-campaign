import fs from 'fs';
import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:8080/';

async function run() {
  const logs = [];
  const errors = [];
  const requestFailures = [];

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location?.url || null,
    };
    logs.push(entry);
  });

  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', message: err?.message || String(err) });
  });

  page.on('requestfailed', (req) => {
    requestFailures.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText || 'unknown',
      resourceType: req.resourceType(),
    });
  });

  const navStart = Date.now();
  await page.goto(FRONTEND_URL, { waitUntil: 'load', timeout: 30000 });
  const navMs = Date.now() - navStart;

  // 确保 #root 存在
  try {
    await page.waitForSelector('#root', { timeout: 10000 });
  } catch {}

  const rootInfo = await page.evaluate(() => {
    const el = document.getElementById('root');
    const html = el?.innerHTML || '';
    const text = el?.innerText || '';
    return {
      exists: !!el,
      innerHTMLLength: html.trim().length,
      innerTextLength: text.trim().length,
      sample: html.trim().slice(0, 200),
    };
  });

  // 截图
  try {
    await page.screenshot({ path: 'frontend_diagnostic.png', fullPage: true });
  } catch {}

  const report = {
    timestamp: new Date().toISOString(),
    url: FRONTEND_URL,
    navigationMs: navMs,
    root: rootInfo,
    console: logs,
    pageErrors: errors,
    requestFailures,
  };

  await fs.promises.writeFile('frontend_diagnostic.json', JSON.stringify(report, null, 2), 'utf8');

  // 控制台输出简要摘要
  console.log(JSON.stringify({
    url: FRONTEND_URL,
    rootExists: report.root.exists,
    rootHasContent: report.root.innerHTMLLength > 0 || report.root.innerTextLength > 0,
    consoleErrors: report.console.filter((l) => l.type === 'error').length,
    pageErrors: report.pageErrors.length,
    requestFailures: report.requestFailures.length,
  }, null, 2));

  await browser.close();
}

run().catch(async (err) => {
  console.error('diagnose-frontend error:', err?.message || err);
  try {
    await fs.promises.writeFile('frontend_diagnostic_error.log', String(err?.stack || err), 'utf8');
  } catch {}
  process.exitCode = 1;
});


