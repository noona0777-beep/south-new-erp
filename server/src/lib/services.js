const nodemailer = require('nodemailer');
const path = require('path');

// Email Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noona0777@gmail.com',
        pass: process.env.EMAIL_PASS
    }
});

// WhatsApp - runs only locally (not on Render/cloud where Chrome is unavailable)
let whatsapp = null;
let whatsappStatus = 'CLOUD_MODE'; // special status for cloud deployments
let qrAvailable = false;
let qrLastUpdate = Date.now();

const isCloudEnvironment = process.env.RENDER || process.env.RAILWAY_ENVIRONMENT || process.env.FLY_APP_NAME;

if (!isCloudEnvironment) {
    try {
        const { Client, LocalAuth } = require('whatsapp-web.js');
        const qrcode = require('qrcode');

        whatsapp = new Client({
            authStrategy: new LocalAuth({
                clientId: "south-new-system",
                dataPath: path.join(__dirname, '../../.wwebjs_auth')
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
            }
        });

        whatsappStatus = 'DISCONNECTED';

        whatsapp.on('qr', (qr) => {
            console.log('📱 WhatsApp QR Received...');
            qrAvailable = true;
            qrLastUpdate = Date.now();
            qrcode.toFile(path.join(__dirname, '../../whatsapp-qr.png'), qr, { scale: 8 }, (err) => {
                if (err) console.error('Error generating QR file:', err);
            });
        });

        whatsapp.on('ready', () => { whatsappStatus = 'READY'; qrAvailable = false; console.log('✅ WhatsApp READY'); });
        whatsapp.on('authenticated', () => { whatsappStatus = 'AUTHENTICATED'; qrAvailable = false; });
        whatsapp.on('auth_failure', () => { whatsappStatus = 'AUTH_FAILURE'; qrAvailable = false; });
        whatsapp.on('disconnected', () => { whatsappStatus = 'DISCONNECTED'; qrAvailable = false; });

        whatsapp.initialize().catch(err => console.error('WhatsApp Init Error:', err));
        console.log('📱 WhatsApp initialized (local mode)');
    } catch (err) {
        console.warn('⚠️ WhatsApp not available:', err.message);
        whatsappStatus = 'UNAVAILABLE';
    }
} else {
    console.log('☁️ Cloud environment detected. WhatsApp disabled (use local machine to connect).');
}

const getWhatsappStatus = () => ({ status: whatsappStatus, qrAvailable, qrLastUpdate });

module.exports = { transporter, whatsapp, getWhatsappStatus };

