const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-proj-dummy', // user will replace this
});

/**
 * دالة لتحليل صور مواقع البناء باستخدام OpenAI Vision
 * @param {string} base64Image - صورة الموقع بتشفير base64
 * @returns {Promise<Object>} - النتائج المستخرجة (المواصفات، المخالفات، التقدم، إلخ)
 */
async function analyzeConstructionImage(base64Image) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text", text: `
أنت مهندس استشاري خبير في البناء وكود البناء السعودي (SBC).
قم بتحليل صورة الموقع المرفقة بدقة وقدم تقريراً فنياً بصيغة JSON فقط بالهيكل التالي:

{
  "detectedObjects": ["قائمة بالعناصر الموجودة مثل: نجارة، تسليح، كتل خرسانية"],
  "cracksDetected": true/false,
  "coverDepthEstimated": "تقدير الغطاء الخرساني إن أمكن رؤيته أو اكتب غير واضح",
  "anomalies": ["أي ملاحظات شاذة أو أخطاء مثل سوء النظافة، صدأ الحديد، انحناء الأعمدة"],
  "progressExtracted": نسبة مئوية تقديرية لحجم العمل (من 0 إلى 100) بناءً على ما يظهر لك في المرحلة الحالية، أرسل رقماً فقط,
  "sbcViolations": "أي مخالفة محتملة لكود البناء السعودي، أو اكتب 'لا يوجد'"
}

لا تضف أي نص خارج كود الـ JSON.
                        ` },
                        {
                            type: "image_url",
                            image_url: {
                                "url": `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 800,
            response_format: { type: "json_object" }
        });

        const resultJsonString = response.choices[0].message.content;
        return JSON.parse(resultJsonString);
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error('فشل تحليل الصورة بواسطة الذكاء الاصطناعي: ' + error.message);
    }
}

module.exports = {
    analyzeConstructionImage
};
