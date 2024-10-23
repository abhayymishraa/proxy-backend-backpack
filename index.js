const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const targetUrl = 'https://api.backpack.exchange'; // Actual API URL
const cors = require('cors');

// Replace with your actual frontend URL
const allowedOrigin = 'https://next-trade-frontend.vercel.app'; 

// Handle CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin === allowedOrigin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Enable CORS
app.use(cors({
    origin: allowedOrigin, // Allow requests only from your frontend
    credentials: true, // Enable credentials for cookies, auth, etc.
}));

// Handle OPTIONS preflight requests
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Function to mock browser headers
const setBrowserHeaders = (proxyReq, req) => {
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
    proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
    proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
    proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
    proxyReq.setHeader('Referer', allowedOrigin);
    proxyReq.setHeader('Origin', allowedOrigin);
    proxyReq.setHeader('Connection', 'keep-alive');
    proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
    proxyReq.setHeader('Cache-Control', 'max-age=0');
    proxyReq.setHeader('DNT', '1'); // Do Not Track
};

// Proxy middleware
app.use('/', createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${targetUrl}${req.url}`);

        // Set headers to simulate a browser request
        setBrowserHeaders(proxyReq, req);

        // Forward cookies if they exist (simulating a real browser session)
        if (req.headers.cookie) {
            proxyReq.setHeader('Cookie', req.headers.cookie);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Response received with status: ${proxyRes.statusCode}`);
    }
}));

// Error handling
app.use((err, req, res, next) => {
    console.error('Error in proxy:', err);
    res.status(500).send('Proxy error');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
