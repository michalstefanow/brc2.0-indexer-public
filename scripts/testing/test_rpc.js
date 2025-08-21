#!/usr/bin/env node

const axios = require('axios');

async function testBRC20RPC() {
    try {
        console.log('🧪 Testing BRC20 Programmable Module RPC Server...\n');
        
        // Test eth_blockNumber
        console.log('1. Testing eth_blockNumber...');
        const response1 = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ eth_blockNumber response:', JSON.stringify(response1.data, null, 2));
        
        // Test brc20_initialise (should fail without proper params, but should respond)
        console.log('\n2. Testing brc20_initialise...');
        const response2 = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'brc20_initialise',
            params: ['dummy_hash', 1234567890, 0],
            id: 2
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ brc20_initialise response:', JSON.stringify(response2.data, null, 2));
        
        console.log('\n🎉 BRC20 Programmable Module RPC Server is working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing BRC20 RPC server:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testBRC20RPC();




