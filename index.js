const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const express = require('express');
const app = express();

// Render la jivant thevnyasathi
app.get('/', (req, res) => res.send('BOT CHALU AAHE - 9172754544'));
app.listen(process.env.PORT || 3000, () => console.log('Server chalu'));

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "bot-9172754544" }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    }
});

const ALLOWED_GROUPS = [
    "नोकरी (जि-सांगली)",
    "नोकरी (जि-कोल्हापूर) 1",
    "नोकरी (जि-कोल्हापूर) 2"
];

const SARKARI = `📢 *SARKARI NOKRI*\n1. MPSC - mpsc.gov.in\n2. Police - mahapolice.gov.in\n3. Railway - rrbapply.gov.in\n4. SSC - ssc.gov.in`;
const PRIVATE = `💼 *PRIVATE JOB - Sangli / Kolhapur*\n1. MIDC Helper / Operator - 15k-25k\n2. IT Fresher - naukri.com\n3. Work From Home - Data Entry - apna.co`;
const GK = `🧠 *AAJCHA GK*\nQ: Maharashtra chi rajdhani? A: Mumbai\nQ: Kolhapur cha mandir? A: Mahalaxmi\nQ: Sangli chi draksha? A: Tasgaon`;

client.on('qr', qr => {
    console.log('QR CODE:');
    qrcode.generate(qr, {small: true});
    // Render Logs madhe QR disel, to scan kara
});

client.on('ready', () => {
    console.log('✅ BOT READY - 3 GROUP');
    cron.schedule('0 8 * * *', async () => {
        const chats = await client.getChats();
        for (let c of chats) {
            if (c.isGroup && ALLOWED_GROUPS.includes(c.name)) {
                await client.sendMessage(c.id._serialized, SARKARI + "\n\n" + PRIVATE);
            }
        }
    });
    cron.schedule('0 12 * * *', async () => {
        const chats = await client.getChats();
        for (let c of chats) {
            if (c.isGroup && ALLOWED_GROUPS.includes(c.name)) await client.sendMessage(c.id._serialized, GK);
        }
    });
});

client.on('message', async msg => {
    const chat = await msg.getChat();
    if (!chat.isGroup || !ALLOWED_GROUPS.includes(chat.name)) return;
    const t = msg.body.toLowerCase().trim();
    if (['hi','menu','job','nokri'].includes(t)) return msg.reply(`🤖 *NOKRI BOT - ${chat.name}*\n\n*JOB* - Sarkari + Private\n*SARKARI* - Fakt Sarkari\n*PRIVATE* - Fakt Private\n*GK* - General Knowledge`);
    if (t === 'job') return msg.reply(SARKARI + "\n\n" + PRIVATE);
    if (t === 'sarkari') return msg.reply(SARKARI);
    if (t === 'private') return msg.reply(PRIVATE);
    if (t === 'gk') return msg.reply(GK);
});

client.initialize();