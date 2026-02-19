# تفصيل الوحدات البرمجية وأمثلة الكود - النظام المحاسبي لمؤسسة الجنوب الجديد

## 1. إعداد المشروع (Initial Setup)

**1.1. هيكلية الخادم (Server Setup)**

```javascript
// server/index.js (Express Setup)
const express = require('express');
const cors = require('cors');
const { appConfig } = require('./config/app');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes); // Main API Endpoint

const PORT = appConfig.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## 2. وحدة المبيعات والفوترة الإلكترونية (Sales & ZATCA Module)

**2.1. نموذج البيانات (Prisma Schema)**

```prisma
// schema.prisma (Sales)
model Invoice {
  id          Int      @id @default(autoincrement())
  type        String   // TAX or SIMPLIFIED
  customer    Customer @relation(fields: [customerId], references: [id])
  customerId  Int
  date        DateTime @default(now())
  total       Float
  taxAmount   Float
  uuid        String   @unique
  prevHash    String?
  qrCode      String?  @db.Text
  items       InvoiceItem[]
}

model InvoiceItem {
  id          Int      @id @default(autoincrement())
  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
  invoiceId   Int
  product     Product  @relation(fields: [productId], references: [id])
  productId   Int
  quantity    Int
  price       Float
  total       Float
}
```

**2.2. خدمة توليد فاتورة ZATCA (ZATCA Service)**

```javascript
// server/services/zatcaService.js
const { InvoiceGenerator } = require('zatca-sdk-custom'); // افتراض وجود مكتبة مساعدة

async function createTaxInvoice(data) {
    // 1. حساب الإجماليات والضريبة
    const totalTax = data.items.reduce((sum, item) => sum + (item.total * 0.15), 0);
    const totalAmount = data.items.reduce((sum, item) => sum + item.total, 0) + totalTax;

    // 2. توليد UUID
    const uuid = crypto.randomUUID();

    // 3. توليد QR Code (TLV Format - Tag-Length-Value)
    const qrData = generateTLV({
        sellerName: 'مؤسسة الجنوب الجديد',
        vatNumber: '3xxxxxxxxxxxxxx',
        timestamp: new Date().toISOString(),
        total: totalAmount.toFixed(2),
        tax: totalTax.toFixed(2)
    });
    
    // 4. حفظ الفاتورة في القاعدة
    const invoice = await prisma.invoice.create({
        data: {
            ...data,
            uuid,
            qrCode: qrData,
            total: totalAmount,
            taxAmount: totalTax,
        }
    });
    
    return invoice;
}
```

## 3. وحدة المخزون (Inventory Module)

**3.1. نموذج حركة المخزون (Inventory Movement)**

```javascript
// server/controllers/inventoryController.js
async function adjustStock(productId, quantity, type) {
    // type: 'IN' (شراء/مرتجع مبيعات) or 'OUT' (بيع/مرتجع شراء)
    const product = await prisma.product.findUnique({ where: { id: productId } });
    
    if (type === 'OUT' && product.stockQuantity < quantity) {
        throw new Error('Stock not sufficient');
    }
    
    const newQuantity = type === 'IN' 
        ? product.stockQuantity + quantity 
        : product.stockQuantity - quantity;
        
    await prisma.product.update({
        where: { id: productId },
        data: { stockQuantity: newQuantity }
    });
}
```

## 4. واجهة المستخدم (React Frontend - Sales Page)

**4.1. مكون الفاتورة (Invoice Component)**

```jsx
// client/src/pages/Sales/Invoice.jsx
import React, { useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';

const InvoiceForm = () => {
    const [items, setItems] = useState([]);
    
    const addItem = (product) => {
        setItems([...items, { ...product, quantity: 1, total: product.price }]);
    };
    
    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + item.total, 0);
    };

    return (
        <div className="invoice-container">
            <header className="invoice-header">
                <h1>فاتورة مبيعات جديدة</h1>
                <div className="client-info">
                   {/* Client Select */}
                </div>
            </header>
            
            <table className="invoice-items">
                <thead>
                    <tr>
                        <th>الصنف</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>
                                <input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={(e) => updateQuantity(index, e.target.value)} 
                                />
                            </td>
                            <td>{item.price}</td>
                            <td>{item.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="invoice-summary">
                <p>الإجمالي قبل الضريبة: {calculateTotal()}</p>
                <p>الضريبة (15%): {(calculateTotal() * 0.15).toFixed(2)}</p>
                <p className="grand-total">الإجمالي النهائي: {(calculateTotal() * 1.15).toFixed(2)}</p>
                
                <button className="btn-save" onClick={saveInvoice}>حفظ الفاتورة</button>
            </div>
        </div>
    );
};
```

## 5. تطبيق سطح المكتب (Electron Integration)

**5.1. ملف التشغيل الرئيسي (Electron Main)**

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // In Build mode, load the remote URL or local index.html
    const appUrl = process.env.APP_URL || 'https://south-new-system.vercel.app';
    win.loadURL(appUrl);
    
    // Remove menu bar
    win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);
```

---
هذه الأمثلة توضح كيفية بناء كل جزء من النظام بشكل منفصل ثم ربطه معاً، بدءاً من قاعدة البيانات ووصولاً لواجهة المستخدم وتغليفها بـ Electron.
