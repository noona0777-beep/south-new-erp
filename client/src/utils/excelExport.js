import * as XLSX from 'xlsx';

/**
 * دالة عامة لتصدير أي بيانات (Array of Objects) إلى ملف Excel مرتب ومنسق
 * @param {Array} data البيانات (مصفوفة كائنات)
 * @param {String} fileName اسم الملف عند التحميل
 * @param {String} sheetName اسم ورقة العمل (الشيت)
 */
export const exportToExcel = (data, fileName = 'Report', sheetName = 'Sheet1') => {
    if (!data || data.length === 0) {
        console.warn("No data available to export");
        return;
    }

    // 1- تحويل المصفوفة إلى ورقة عمل إكسل
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2- ضبط حجم الأعمدة التلقائي 
    // استخراج أسماء الأعمدة (العناوين) ومقارنتها بأطول محتوى بكل عمود لكي يتمدد حجم العمود تلقائيا في الاكسل
    const columnWidths = [];
    const keys = Object.keys(data[0]);

    keys.forEach((key) => {
        let maxLength = key.length; // البداية تكون بطول اسم الرأس نفسه
        data.forEach((row) => {
            const cellVal = row[key];
            if (cellVal !== null && cellVal !== undefined) {
                const valStr = cellVal.toString();
                if (valStr.length > maxLength) {
                    maxLength = valStr.length;
                }
            }
        });
        // إضافة بعض العرض الإضافي للوضوح (Padding)
        columnWidths.push({ wch: maxLength + 5 });
    });

    worksheet['!cols'] = columnWidths;
    worksheet['!dir'] = 'rtl'; // لدعم اللغة العربية بتوجه الشيت من اليمين لليسار

    // 3- إضافة الورقة البيضاء وحفظها
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    // 4- أمان إضافي: إزالة أي رموز قد يرفضها نظام التشغيل (مثل / أو \)
    let safeFileName = String(fileName).replace(/\.xlsx$/i, '').replace(/[\\/:*?"<>|]/g, '-').trim();
    
    // متصفح Chrome يحذف الامتداد إذا كان اسم الملف ينتهي بحرف أو نص عربي 
    // وذلك بسبب خوارزمية الحماية من انتحال الامتدادات (Spoofing) للنصوص مزدوجة الاتجاه.
    // الحل الجذري هو إجبار إنهاء الاسم بحرف أو كلمة لاتينية (مثل _Report) قبل الامتداد.
    safeFileName = safeFileName + '_Report.xlsx';
    
    // 5- التصدير باستخدام الدالة المدمجة والموثوقة في المكتبة للتوافقية التامة مع كل المتصفحات
    XLSX.writeFile(workbook, safeFileName);
};
