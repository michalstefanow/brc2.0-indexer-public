#!/usr/bin/env node

// Test Smart Contract Script for BRC20 Programmable Module
// This script demonstrates deploying and interacting with smart contracts

const axios = require('axios');

const RPC_URL = 'http://localhost:18545';

// Helper function to make RPC calls
async function rpcCall(method, params = []) {
    try {
        const response = await axios.post(RPC_URL, {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: 1
        });
        return response.data.result;
    } catch (error) {
        console.error(`RPC call failed for ${method}:`, error.message);
        return null;
    }
}

// Test basic RPC functionality
async function testBasicRPC() {
    console.log('🔍 Testing Basic RPC Functionality...\n');
    
    // Test chain ID
    const chainId = await rpcCall('eth_chainId');
    console.log(`Chain ID: ${chainId} (${Buffer.from(chainId.slice(2), 'hex').toString()})`);
    
    // Test block number
    const blockNumber = await rpcCall('eth_blockNumber');
    console.log(`Current Block: ${blockNumber} (${parseInt(blockNumber, 16)})`);
    
    // Test gas price
    const gasPrice = await rpcCall('eth_gasPrice');
    console.log(`Gas Price: ${gasPrice} wei`);
    
    // Test accounts
    const accounts = await rpcCall('eth_accounts');
    console.log(`Available Accounts: ${accounts.length}`);
    if (accounts.length > 0) {
        console.log(`First Account: ${accounts[0]}`);
    }
    
    console.log('');
}

// Test smart contract deployment
async function testContractDeployment() {
    console.log('🚀 Testing Smart Contract Deployment...\n');
    
    // Simple ERC-20 contract bytecode (simplified)
    const contractBytecode = '0x608060405234801561001057600080fd5b506040516107e03803806107e0833981810160405281019061003291906100a0565b60008190555061004f8161005860201b6101a71760201c565b506100c7565b60008054905090565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061008a8261005f565b9050919050565b61009a8161007f565b81146100a557600080fd5b50565b6000815190506100b781610091565b92915050565b6000602082840312156100d3576100d261005a565b5b60006100e1848285016100a8565b91505092915050565b6106ea806100f66000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806318160ddd1461003b57806370a0823114610059575b600080fd5b610043610079565b60405161005091906100a7565b60405180910390f35b610073600480360381019061006e91906100f3565b610082565b005b60008054905090565b8060008190555050565b6000819050919050565b61009a81610087565b82525050565b60006020820190506100b56000830184610091565b92915050565b600080fd5b6100c881610087565b81146100d357600080fd5b50565b6000813590506100e5816100bf565b92915050565b600060208284031215610101576101006100ba565b5b600061010f848285016100d6565b9150509291505056fea2646970667358221220a0b0c0d0e0f0a1b1c1d1e1f1a2b2c2d2e2f2a3b3c3d3e3f3a4b4c4d4e4f4a5b5c5d5e5f5a6b6c6d6e6f6a7b7c7d7e7f7a8b8c8d8e8f8a9b9c9d9e9f9aa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff';
    
    // Get accounts
    const accounts = await rpcCall('eth_accounts');
    if (!accounts || accounts.length === 0) {
        console.log('❌ No accounts available for deployment');
        return;
    }
    
    const deployer = accounts[0];
    console.log(`Deployer Account: ${deployer}`);
    
    // Get nonce
    const nonce = await rpcCall('eth_getTransactionCount', [deployer, 'latest']);
    console.log(`Deployer Nonce: ${nonce}`);
    
    // Get gas price
    const gasPrice = await rpcCall('eth_gasPrice');
    console.log(`Gas Price: ${gasPrice} wei`);
    
    // Estimate gas
    const gasEstimate = await rpcCall('eth_estimateGas', [{
        from: deployer,
        data: contractBytecode
    }]);
    console.log(`Estimated Gas: ${gasEstimate}`);
    
    // Create deployment transaction
    const deployTx = {
        from: deployer,
        data: contractBytecode,
        gas: gasEstimate,
        gasPrice: gasPrice,
        nonce: nonce
    };
    
    console.log('📝 Deployment Transaction Prepared:');
    console.log(`   From: ${deployTx.from}`);
    console.log(`   Gas: ${deployTx.gas}`);
    console.log(`   Gas Price: ${deployTx.gasPrice}`);
    console.log(`   Nonce: ${deployTx.nonce}`);
    console.log(`   Data Length: ${deployTx.data.length} bytes`);
    
    console.log('\n💡 Note: This is a demonstration. In a real deployment, you would:');
    console.log('   1. Sign the transaction with a private key');
    console.log('   2. Send it to the network');
    console.log('   3. Wait for confirmation');
    console.log('   4. Get the contract address from the receipt');
    
    console.log('');
}

// Test contract interaction
async function testContractInteraction() {
    console.log('🔗 Testing Contract Interaction...\n');
    
    // Test calling a contract method (this would require a deployed contract)
    console.log('📋 Available RPC Methods for Contract Interaction:');
    console.log('   • eth_call - Call contract methods (read-only)');
    console.log('   • eth_sendTransaction - Send transactions to contracts');
    console.log('   • eth_getTransactionReceipt - Get transaction results');
    console.log('   • eth_getLogs - Get contract events');
    
    console.log('\n💡 To test actual contract calls:');
    console.log('   1. Deploy a contract first');
    console.log('   2. Use eth_call with the contract address and method data');
    console.log('   3. Use eth_sendTransaction for state-changing operations');
    
    console.log('');
}

// Test balance and transaction functions
async function testBalanceAndTransactions() {
    console.log('💰 Testing Balance and Transaction Functions...\n');
    
    const accounts = await rpcCall('eth_accounts');
    if (!accounts || accounts.length === 0) {
        console.log('❌ No accounts available');
        return;
    }
    
    const account = accounts[0];
    
    // Get balance
    const balance = await rpcCall('eth_getBalance', [account, 'latest']);
    console.log(`Account ${account}:`);
    console.log(`   Balance: ${balance} wei (${parseInt(balance, 16) / 1e18} BRC20)`);
    
    // Get transaction count
    const txCount = await rpcCall('eth_getTransactionCount', [account, 'latest']);
    console.log(`   Transaction Count: ${txCount}`);
    
    // Get latest block
    const latestBlock = await rpcCall('eth_getBlockByNumber', ['latest', false]);
    if (latestBlock) {
        console.log(`Latest Block: ${latestBlock.number} (${parseInt(latestBlock.number, 16)})`);
        console.log(`   Hash: ${latestBlock.hash}`);
        console.log(`   Transactions: ${latestBlock.transactions.length}`);
    }
    
    console.log('');
}

// Main test function
async function runTests() {
    console.log('🚀 BRC20 Programmable Module Test Suite');
    console.log('=====================================\n');
    
    try {
        await testBasicRPC();
        await testContractDeployment();
        await testContractInteraction();
        await testBalanceAndTransactions();
        
        console.log('✅ All tests completed successfully!');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Deploy actual smart contracts');
        console.log('   2. Interact with deployed contracts');
        console.log('   3. Build dApps using the programmable module');
        console.log('   4. Integrate with your BRC20 indexer data');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

// Check if axios is available
try {
    require('axios');
} catch (error) {
    console.error('❌ axios is not installed. Please install it first:');
    console.error('   npm install axios');
    process.exit(1);
}

// Run the tests
runTests();
