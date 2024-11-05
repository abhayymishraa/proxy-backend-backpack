const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const targetUrl = 'https://api.backpack.exchange'; // Actual API URL
const cors = require('cors');

// Replace with your actual frontend URL
const allowedOrigin = 'https://next-trade-frontend.vercel.app'; 

// Handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
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

app.use('/', createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${targetUrl}${req.url}`);

        // Set the headers to mimic a request from backpack.exchange
        proxyReq.setHeader('Origin', 'https://backpack.exchange');
        proxyReq.setHeader('sec-fetch-site', 'same-site');
        proxyReq.setHeader('sec-fetch-mode', 'cors');
        proxyReq.setHeader('sec-fetch-dest', 'empty');
        proxyReq.setHeader('sec-ch-ua', '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"');
        proxyReq.setHeader('sec-ch-ua-mobile', '?0');
        proxyReq.setHeader('sec-ch-ua-platform', '"Linux"');
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
