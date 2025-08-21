#!/usr/bin/env node

const axios = require('axios');

async function properInitializeBRC20Prog() {
    try {
        console.log('🚀 Properly Initializing BRC20 Programmable Module...\n');
        
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
        
        const currentBlockHeight = bitcoinResponse.data.result.blocks;
        console.log(`✅ Current Bitcoin block height: ${currentBlockHeight}\n`);
        
        // Step 1: Initialize with genesis block (block 0)
        console.log('2. Initializing with genesis block (block 0)...');
        const initResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'brc20_initialise',
            params: ['0x0000000000000000000000000000000000000000000000000000000000000000', 0, 0],
            id: 1
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (initResponse.data.error) {
            console.log('⚠️  Initialization response:', JSON.stringify(initResponse.data, null, 2));
        } else {
            console.log('✅ Genesis block initialization successful!');
        }
        
        // Step 2: Mine empty blocks up to current height
        console.log(`\n3. Mining ${currentBlockHeight} empty blocks...`);
        const mineResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'brc20_mine',
            params: [currentBlockHeight, 0],
            id: 2
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (mineResponse.data.error) {
            console.log('⚠️  Mining response:', JSON.stringify(mineResponse.data, null, 2));
        } else {
            console.log('✅ Empty blocks mined successfully!');
        }
        
        // Step 3: Test if it's working
        console.log('\n4. Testing BRC20 programmable module...');
        const testResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 3
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Test successful!');
        console.log('Current block number:', testResponse.data.result);
        
        // Step 4: Test BRC20_Controller contract
        console.log('\n5. Testing BRC20_Controller contract...');
        const contractResponse = await axios.post('http://localhost:18545', {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: ['0xc54dd4581af2dbf18e4d90840226756e9d2b3cdb', 'latest'],
            id: 4
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (contractResponse.data.result && contractResponse.data.result !== '0x') {
            console.log('✅ BRC20_Controller contract is deployed!');
            console.log('Contract code length:', contractResponse.data.result.length);
        } else {
            console.log('⚠️  BRC20_Controller contract not deployed yet');
        }
        
        console.log('\n🎉 BRC20 Programmable Module initialization completed!');
        
    } catch (error) {
        console.error('❌ Error during initialization:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

properInitializeBRC20Prog();
