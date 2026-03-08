const nodemailer = require('nodemailer');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const qrcode = require('qrcode');

// Email Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noona0777@gmail.com',
        pass: process.env.EMAIL_PASS
    }
});

// WhatsApp Setup
const whatsapp = new Client({
    authStrategy: new LocalAuth({
        clientId: "south-new-system",
        dataPath: path.join(__dirname, '../../.wwebjs_auth')
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
    }
});

let whatsappStatus = 'DISCONNECTED';
let qrAvailable = false;
let qrLastUpdate = Date.now();

whatsapp.on('qr', (qr) => {
    console.log('📱 WhatsApp QR Received. Saving to whatsapp-qr.png...');
    qrAvailable = true;
    qrLastUpdate = Date.now();
    qrcode.toFile(path.join(__dirname, '../../whatsapp-qr.png'), qr, {
        scale: 8
    }, (err) => {
        if (err) console.error('Error generating QR file:', err);
    });
});

whatsapp.on('ready', () => { whatsappStatus = 'READY'; qrAvailable = false; console.log('✅ WhatsApp READY'); });
whatsapp.on('authenticated', () => { whatsappStatus = 'AUTHENTICATED'; qrAvailable = false; });
whatsapp.on('auth_failure', () => { whatsappStatus = 'AUTH_FAILURE'; qrAvailable = false; });
whatsapp.on('disconnected', () => { whatsappStatus = 'DISCONNECTED'; qrAvailable = false; });

whatsapp.initialize().catch(err => console.error('WhatsApp Init Error:', err));

const getWhatsappStatus = () => ({ status: whatsappStatus, qrAvailable, qrLastUpdate });

module.exports = { transporter, whatsapp, getWhatsappStatus };
