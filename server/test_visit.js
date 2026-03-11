const axios = require('axios');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function run() {
    try {
        console.log("Generating Test Admin Token...");
        const token = jwt.sign({ id: 35, role: 'ADMIN', name: 'Admin User' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
        const headers = { Authorization: `Bearer ${token}` };

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        let client = await prisma.partner.findFirst({ where: { phone: '0500000781' } });
        if (!client) {
            client = await prisma.partner.findFirst({ where: { phone: { contains: '0500' } } });
        }
        if (!client) {
            client = await prisma.partner.findFirst({ where: { type: 'CUSTOMER' } });
        }

        console.log(`Found Client: ${client.name} (Phone: ${client.phone})`);

        console.log("1. Creating Project...");
        const projectRes = await axios.post('http://localhost:5000/api/projects', {
            name: `مشروع فيلا السيد ${client.name.split(' ')[0]}`,
            description: 'مشروع بناء وتسليم مفتاح',
            clientId: client.id,
            location: 'الرياض، حي الملقا',
            startDate: new Date(),
            budget: 1500000
        }, { headers });
        const project = projectRes.data;
        console.log("✅ Project created with ID:", project.id);

        let engineer = await prisma.employee.findFirst({ where: { jobTitle: { contains: 'مهندس' } } });
        if (!engineer) {
            engineer = await prisma.employee.findFirst();
        }

        console.log(`2. Creating Site Visit by Engineer ${engineer.name}...`);
        const visitRes = await axios.post('http://localhost:5000/api/field-ops/visits', {
            projectId: project.id,
            engineerId: engineer.id,
            notes: 'تم فحص الموقع ومطابقة المخططات الهندسية مع الواقع الإنشائي، وصب القواعد الأرضية مطابق للمواصفات.',
            gpsLocation: '24.7136, 46.6753'
        }, { headers });
        
        console.log("✅ Site Visit created successfully:");
        console.log(visitRes.data);
        console.log("🚀 WhatsApp notification should have triggered on the backend!");

    } catch (e) {
        console.error("Error:", e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}

run();
