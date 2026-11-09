
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('JOB BOT IS RUNNING'));
app.get('/health', (req, res) => res.json({ status: 'running' }));

app.listen(PORT, () => console.log('Web server started'));

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'job-bot' }),
    puppeteer: {
    executablePath: '/opt/render/.cache/puppeteer/chrome/linux-146.0.7680.31/chrome-linux64/chrome',
    headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    }
});

const ALLOWED_GROUPS = [
    'नोकरी (जि-सांगली)',
    'नोकरी (जि-कोल्हापूर) 1',
    'नोकरी (जि-कोल्हापूर) 2'
];

const SARKARI = `📢 *SARKARI NOKRI*

1. MPSC - https://mpsc.gov.in
2. Police - https://mahapolice.gov.in
3. Railway - https://rrbapply.gov.in
4. SSC - https://ssc.gov.in

अर्ज करण्यापूर्वी अधिकृत जाहिरात तपासा.`;

const PRIVATE = `💼 *PRIVATE JOB - Sangli / Kolhapur*

1. MIDC Helper / Operator - 15k-25k
2. IT Fresher - naukri.com
3. Work From Home - apna.co

टीप: या नमुना संधी आहेत. अर्जापूर्वी सत्यता तपासा.`;

const GK = `🧠 *AAJCHA GK*

Q: Maharashtra chi rajdhani?
A: Mumbai

Q: Kolhapur che prasiddha mandir?
A: Mahalaxmi

Q: Sangli madhil prasiddha draksha kendra?
A: Tasgaon`;

const AD = `📢 *A INFOTECH MARKETPLACE*

तुमचा व्यवसाय, जाहिरात आणि नोकरीची माहिती एका डिजिटल प्लॅटफॉर्मवर!

✅ Business Directory
✅ Online Advertisement
✅ Job Portal
✅ Employer & Employee Registration

🌐 https://ainfotech-8287b.web.app/

*A Infotech – तुमच्या व्यवसायाची डिजिटल ओळख!*`;

const MENU = `🤖 *NOKRI BOT*

JOB - Sarkari + Private
SARKARI - Fakt Sarkari
PRIVATE - Fakt Private
GK - General Knowledge
MENU - Commands paha`;

async function sendToGroups(message) {
    try {
        const chats = await client.getChats();
        for (const chat of chats) {
            if (chat.isGroup && ALLOWED_GROUPS.includes(chat.name)) {
                await client.sendMessage(chat.id._serialized, message);
                console.log('Message sent: ' + chat.name);
            }
        }
    } catch (err) {
        console.error('Send error:', err.message);
    }
}

client.on('qr', qr => {
    console.log('SCAN QR CODE');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => console.log('WhatsApp authenticated'));

client.on('ready', () => {
    console.log('BOT READY - WhatsApp Connected');

    cron.schedule('0 8 * * *', () => {
        sendToGroups(SARKARI + '\n\n' + PRIVATE);
    }, { timezone: 'Asia/Kolkata' });

    cron.schedule('0 12 * * *', () => {
        sendToGroups(GK);
    }, { timezone: 'Asia/Kolkata' });

    cron.schedule('0 18 * * *', () => {
        sendToGroups(AD);
    }, { timezone: 'Asia/Kolkata' });
});

client.on('message', async msg => {
    try {
        if (msg.fromMe) return;

        const chat = await msg.getChat();
        if (!chat.isGroup || !ALLOWED_GROUPS.includes(chat.name)) return;

        const command = msg.body.toLowerCase().trim();

        if (['hi', 'hello', 'menu', 'nokri'].includes(command)) {
            return msg.reply(MENU);
        }
        if (command === 'job') return msg.reply(SARKARI + '\n\n' + PRIVATE);
        if (command === 'sarkari') return msg.reply(SARKARI);
        if (command === 'private') return msg.reply(PRIVATE);
        if (command === 'gk') return msg.reply(GK);

    } catch (err) {
        console.error('Message error:', err.message);
    }
});

client.on('auth_failure', msg => console.error('Authentication failed:', msg));
client.on('disconnected', reason => console.log('Disconnected:', reason));

client.initialize().catch(err => console.error('Initialization error:', err));
