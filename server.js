const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function saveCookies(page, filePath) {
  const cookies = await page.cookies();
  fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(cookies, null, 2));
}

async function loadCookies(filePath) {
  try {
    const cookiesString = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
    return JSON.parse(cookiesString);
  } catch {
    return null;
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const contextA = await browser.createIncognitoBrowserContext();
  const pageA = await contextA.newPage();
  await pageA.goto('https://www.facebook.com');
  await new Promise(resolve => setTimeout(resolve, 90000));

  await saveCookies(pageA, './cookies/userA.json');

  const contextB = await browser.createIncognitoBrowserContext();
  const pageB = await contextB.newPage();

  const cookiesUserA = await loadCookies('./cookies/userA.json');
  if (cookiesUserA) {
    await pageB.setCookie(...cookiesUserA);
  }
  await pageB.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });
})();
