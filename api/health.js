export default function handler(req, res) {
    res.status(200).json({
        status: 'Serverless Health Check OK',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
}
