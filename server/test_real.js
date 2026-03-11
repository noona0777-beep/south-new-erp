const axios = require('axios');

async function testInvoice() {
    try {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: 1, role: 'ADMIN', email: 'admin@south.com' }, 'super_secret_key_for_south_new_system_2024');

        // Post Invoice
        const invRes = await axios.post('http://localhost:5000/api/invoices', {
            partnerId: 1,
            date: "2024-03-01",
            type: "SALES_TAX",
            items: [
                { description: "Test item", quantity: 1, unitPrice: 100 }
            ],
            discount: 0
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Invoice created:', invRes.data);

        // Fetch Invoices
        const getRes = await axios.get('http://localhost:5000/api/invoices');
        console.log('Fetched invoices count:', getRes.data.length);

    } catch (e) {
        if (e.response) {
            console.error('Server responded with:', e.response.status, e.response.data);
        } else {
            console.error('Network Error:', e.message);
        }
    }
}

testInvoice();
