const prisma = require('../lib/prisma');

async function logActivity(userId, action, entity, entityId, details) {
    try {
        if (!userId) return;
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entity,
                entityId: entityId ? parseInt(entityId) : null,
                details
            }
        });
    } catch (e) {
        console.error('Logging failed', e);
    }
}

function generateZatcaTLV(seller, vatNo, timestamp, total, vatTotal) {
    try {
        const tags = [
            seller || 'مؤسسة الجنوب',
            vatNo || '310123456700003',
            timestamp || new Date().toISOString(),
            total || '0.00',
            vatTotal || '0.00'
        ];
        let tlv = Buffer.alloc(0);
        tags.forEach((val, i) => {
            const tag = i + 1;
            const value = Buffer.from(val.toString(), 'utf8');
            const tagBuf = Buffer.from([tag]);
            const lenBuf = Buffer.from([value.length]);
            tlv = Buffer.concat([tlv, tagBuf, lenBuf, value]);
        });
        return tlv.toString('base64');
    } catch (e) {
        console.error('TLV Generation Failed', e);
        return "";
    }
}

async function getOrCreateWarehouse(prismaInstance = prisma) {
    let warehouse = await prismaInstance.warehouse.findFirst();
    if (!warehouse) {
        warehouse = await prismaInstance.warehouse.create({
            data: { name: 'المستودع الرئيسي', location: 'المقر الرئيسي' }
        });
    }
    return warehouse;
}

module.exports = { logActivity, generateZatcaTLV, getOrCreateWarehouse };

