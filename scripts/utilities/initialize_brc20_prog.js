#!/usr/bin/env node

const axios = require('axios');

async function initializeBRC20Prog() {
    try {
        console.log('🚀 Initializing BRC20 Programmable Module...\n');
        
        // Get current Bitcoin block info
        console.log('1. Getting current Bitcoin block info...');
        const bitcoinResponse = await axios.post('http://localhost:38332', {
            jsonrpc: '1.0',
            id: 'init',
            method: 'getblockchaininfo',
            params: []
        }, {
            auth: {
                username: 'bitcoinuser',
                password: 'bitcoinpassword'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const blockHeight = bitcoinResponse.data.result.blocks;
        const blockHash = bitcoinResponse.data.result.bestblockhash;
        const currentTime = Math.floor(Date.now() / 1000);
        
        console.log(`✅ Bitcoin block height: ${blockHeight}`);
        console.log(`✅ Bitcoin block hash: ${blockHash}`);
        console.log(`✅ Current timestamp: ${currentTime}\n`);
        
        // Initialize BRC20 programmable module
        console.log('2. Initializing BRC20 programmable module...');
        const initResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'brc20_initialise',
            params: [blockHash, currentTime, blockHeight],
            id: 1
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ BRC20 programmable module initialized successfully!');
        console.log('Response:', JSON.stringify(initResponse.data, null, 2));
        
        // Test if it's working
        console.log('\n3. Testing BRC20 programmable module...');
        const testResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 2
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Test successful!');
        console.log('Current block number:', testResponse.data.result);
        
        console.log('\n🎉 BRC20 Programmable Module is now fully operational!');
        
    } catch (error) {
        console.error('❌ Error initializing BRC20 programmable module:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

initializeBRC20Prog();
