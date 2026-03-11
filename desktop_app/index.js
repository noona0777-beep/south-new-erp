const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "برنامج مؤسسة الجنوب الجديد - ERP",
        icon: path.join(__dirname, '../client/public/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // إزالة شريط القوائم العلوي لتجربة تطبيق أصلي
    win.setMenuBarVisibility(false);

    // ربط نافذة الديسكتوب بسيرفر التطوير الموجود لدينا
    // ملاحظة: في مرحلة الإنتاج (Production)، سيتم استدعاء ملفات الـ Build بدلاً من الرابط
    win.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
