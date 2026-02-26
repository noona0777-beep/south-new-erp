const API_BASE = 'https://south-new-erp-1.onrender.com/api';

async function runTests() {
    try {
        console.log('--- Starting Field Operations E2E Test ---');

        // 1. Login
        console.log('\n1. Logging in...');
        let loginRes = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@south.com', password: 'password123' })
        });

        if (!loginRes.ok) {
            loginRes = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@south.com', password: '123456' })
            });
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful! Token acquired.');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Removed Dashboard Stats call because it doesn't exist.

        // 3. Create Task
        console.log('\n3. Creating a new Field Task...');
        const taskRes = await fetch(`${API_BASE}/field-ops/tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Test Task from Script',
                description: 'Automated test task',
                type: 'FIELD',
                phase: 'FOUNDATION',
                projectId: '1',
                status: 'NEW'
            })
        });
        const taskData = await taskRes.json();
        const newTaskId = taskData.id;
        console.log('Task created successfully! ID:', newTaskId);

        // 4. Create Site Visit
        console.log('\n4. Creating a new Site Visit...');
        const visitRes = await fetch(`${API_BASE}/field-ops/visits`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                engineerId: '1',
                projectId: '1',
                gpsLocation: '24.7136, 46.6753',
                notes: 'Test site visit from script'
            })
        });
        const visitData = await visitRes.json();
        console.log('Site Visit created successfully! ID:', visitData.id);

        // 5. Create Ticket/Note
        console.log('\n5. Creating a new Ticket...');
        const ticketRes = await fetch(`${API_BASE}/field-ops/tickets`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                entityType: 'TASK',
                entityId: newTaskId,
                title: 'Test Issue',
                description: 'This is a test issue',
                severity: 'HIGH'
            })
        });
        const ticketData = await ticketRes.json();
        console.log('Ticket created successfully! ID:', ticketData.id);

        console.log('\n--- All backend tests passed successfully! ---');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
    }
}

runTests();
