const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const targetUrl = 'https://api.backpack.exchange'; // Actual API URL
const cors = require('cors');

// Replace with your actual frontend URL that will make requests to this proxy
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

// Enable CORS (optional, but helpful to explicitly include it)
app.use(cors({
    origin: allowedOrigin, // Allow requests only from your frontend
    credentials: true, // Enable credentials for cookies, auth, etc.
}));

// Handle OPTIONS preflight requests
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Proxy middleware
app.use('/', createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${targetUrl}${req.url}`);

        // Optionally modify headers to mimic browser requests
        proxyReq.setHeader('User-Agent', req.headers['user-agent']);
        proxyReq.setHeader('Referer', allowedOrigin);
        proxyReq.setHeader('Origin', allowedOrigin);
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
