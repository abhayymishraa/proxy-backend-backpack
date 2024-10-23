const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const targetUrl = 'https://api.backpack.exchange';
const cors  = require('cors')

// Handle CORS
const allowedOrigin = 'https://next-trade-frontend.vercel.app'; // Replace with your actual frontend URL

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

app.use(cors());

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

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
