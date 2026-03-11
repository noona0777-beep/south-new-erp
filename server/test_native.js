const http = require('http');

/**
 * Native Node.js HTTP implementation to test WhatsApp Status
 */
function checkWhatsAppStatus() {
    console.log('🚀 Checking WhatsApp Status (Native Hook)...');

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/whatsapp/status',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const status = JSON.parse(data);
                console.log('✅ Connected to Server API.');
                console.log('📱 Status:', status.status);
                console.log('📅 Last Update:', new Date(status.qrLastUpdate).toLocaleString('ar-SA'));
                
                if (status.status === 'READY') {
                    console.log('🟢 Service is READY and AUTOMATED.');
                } else if (status.status === 'AUTHENTICATED') {
                    console.log('🔵 Service is AUTHENTICATED. Waiting for fully ready...');
                } else {
                    console.log('⚠️ Service status is: ' + status.status + '. Action may be needed (scan QR).');
                }
            } catch (e) {
                console.log('❌ Error parsing response:', e.message);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Connection to server failed. Is the server running?');
        console.error('   ' + error.message);
    });

    req.end();
}

checkWhatsAppStatus();
