#!/usr/bin/env node

const axios = require('axios');

async function testContractInteractions() {
    try {
        console.log('🧪 Testing Smart Contract Interactions...\n');
        
        // Test 1: Call a contract function
        console.log('1. Testing contract function call...');
        const callResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'brc20_call',
            params: [
                'tb1p6pman9q5kenjht50eyj46d5yju99mp36c63ru2puuf4a0zg73z9q97zgw9', // from_pkscript
                '0xc54dd4581af2dbf18e4d90840226756e9d2b3cdb', // contract_address (BRC20_Controller)
                'test_contract_inscription_456', // contract_inscription_id
                '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b60000000000000000000000000000000000000000000000000000000000000064', // data (transfer function call)
                'aHR0cHM6Ly9leGFtcGxlLmNvbS9jYWxsLmJpbg==', // base64_data
                Math.floor(Date.now() / 1000), // timestamp
                '0x0000000000000000000000000000000000000000000000000000000000000000', // hash
                0, // tx_idx
                'test_call_inscription_789', // inscription_id
                500 // inscription_byte_len
            ],
            id: 1
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Contract call response:', JSON.stringify(callResponse.data, null, 2));
        
        // Test 2: Get contract code
        console.log('\n2. Testing contract code retrieval...');
        const codeResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: ['0xc54dd4581af2dbf18e4d90840226756e9d2b3cdb', 'latest'],
            id: 2
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (codeResponse.data.result && codeResponse.data.result !== '0x') {
            console.log('✅ Contract code retrieved successfully');
            console.log('Code length:', codeResponse.data.result.length);
        }
        
        // Test 3: Get transaction receipt
        console.log('\n3. Testing transaction receipt retrieval...');
        const receiptResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'brc20_getTxReceiptByInscriptionId',
            params: ['test_call_inscription_789'],
            id: 3
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Receipt response:', JSON.stringify(receiptResponse.data, null, 2));
        
        console.log('\n🎉 Contract Interaction Tests Completed!');
        
    } catch (error) {
        console.error('❌ Error testing contract interactions:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testContractInteractions();
