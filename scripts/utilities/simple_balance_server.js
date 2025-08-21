#!/usr/bin/env node

const http = require('http');
const url = require('url');

// Simple BRC20 Balance Server
// This provides the minimal responses needed for the BRC20 indexer to work with the programmable module

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pkscript, ticker } = parsedUrl.query;
    
    console.log(`📊 Balance request: pkscript=${pkscript}, ticker=${ticker}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Return a simple balance response
    // In production, this would query the actual BRC20 balances
    const response = {
        pkscript: pkscript || '',
        ticker: ticker || '',
        balance: '0',
        available_balance: '0',
        transferable_balance: '0',
        timestamp: Date.now()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
});

const PORT = 18546;

server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 BRC20 Balance Server running on http://127.0.0.1:${PORT}`);
    console.log(`📝 This server provides balance responses for BRC20 programmable module integration`);
    console.log(`🔧 Responses are mock data - replace with real balance logic in production`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down BRC20 Balance Server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down BRC20 Balance Server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
