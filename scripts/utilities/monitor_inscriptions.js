#!/usr/bin/env node

// Monitor Signet Network for New Inscriptions
// This script watches for new blocks and inscriptions in real-time

const axios = require('axios');

const BITCOIN_RPC_URL = 'http://localhost:38332';
const BITCOIN_RPC_USER = 'bitcoinuser';
const BITCOIN_RPC_PASS = 'bitcoinpassword';

// Helper function to make Bitcoin RPC calls
async function bitcoinRPC(method, params = []) {
    try {
        const response = await axios.post(BITCOIN_RPC_URL, {
            jsonrpc: '1.0',
            id: 'monitor',
            method: method,
            params: params
        }, {
            auth: {
                username: BITCOIN_RPC_USER,
                password: BITCOIN_RPC_PASS
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.result;
    } catch (error) {
        console.error(`Bitcoin RPC call failed for ${method}:`, error.message);
        return null;
    }
}

// Get current blockchain info
async function getBlockchainInfo() {
    return await bitcoinRPC('getblockchaininfo');
}

// Get block by height
async function getBlockByHeight(height) {
    try {
        const blockHash = await bitcoinRPC('getblockhash', [height]);
        if (!blockHash) return null;
        
        const block = await bitcoinRPC('getblock', [blockHash, 2]); // Verbose level 2 for full transaction details
        return block;
    } catch (error) {
        console.error(`Error getting block ${height}:`, error.message);
        return null;
    }
}

// Check for inscriptions in a transaction
function findInscriptions(tx) {
    const inscriptions = [];
    
    if (tx.vout && tx.vout.length > 0) {
        tx.vout.forEach((output, index) => {
            if (output.scriptPubKey && output.scriptPubKey.asm) {
                const asm = output.scriptPubKey.asm;
                
                // Look for OP_RETURN (data carrier)
                if (asm.includes('OP_RETURN')) {
                    inscriptions.push({
                        type: 'OP_RETURN',
                        outputIndex: index,
                        script: asm,
                        value: output.value
                    });
                }
                
                // Look for Taproot outputs (potential inscriptions)
                if (output.scriptPubKey.type === 'witness_v1_taproot') {
                    inscriptions.push({
                        type: 'Taproot',
                        outputIndex: index,
                        address: output.scriptPubKey.address,
                        value: output.value
                    });
                }
            }
        });
    }
    
    return inscriptions;
}

// Monitor new blocks for inscriptions
async function monitorNewBlocks() {
    console.log('🔍 Monitoring Signet Network for New Inscriptions...\n');
    
    let lastKnownBlock = 0;
    
    while (true) {
        try {
            // Get current blockchain info
            const blockchainInfo = await getBlockchainInfo();
            if (!blockchainInfo) {
                console.log('❌ Failed to get blockchain info, retrying...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            
            const currentBlock = blockchainInfo.blocks;
            
            // Check if we have a new block
            if (currentBlock > lastKnownBlock) {
                if (lastKnownBlock === 0) {
                    console.log(`📍 Starting monitoring from block ${currentBlock}`);
                    lastKnownBlock = currentBlock;
                } else {
                    console.log(`\n🆕 New block detected: ${currentBlock}`);
                    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
                    
                    // Process new blocks
                    for (let height = lastKnownBlock + 1; height <= currentBlock; height++) {
                        await processBlock(height);
                    }
                    
                    lastKnownBlock = currentBlock;
                }
            }
            
            // Wait before checking again
            await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
            
        } catch (error) {
            console.error('❌ Error in monitoring loop:', error.message);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

// Process a single block
async function processBlock(height) {
    try {
        console.log(`\n📦 Processing block ${height}...`);
        
        const block = await getBlockByHeight(height);
        if (!block) {
            console.log(`   ❌ Failed to get block ${height}`);
            return;
        }
        
        console.log(`   📊 Block Hash: ${block.hash}`);
        console.log(`   🕒 Time: ${new Date(block.time * 1000).toLocaleString()}`);
        console.log(`   💰 Transactions: ${block.transactions ? block.transactions.length : 0}`);
        
        // Check for inscriptions in transactions
        if (block.transactions && block.transactions.length > 0) {
            let inscriptionCount = 0;
            
            for (const tx of block.transactions) {
                const inscriptions = findInscriptions(tx);
                if (inscriptions.length > 0) {
                    inscriptionCount += inscriptions.length;
                    console.log(`   🔍 Transaction ${tx.txid.slice(0, 16)}... has ${inscriptions.length} potential inscription(s)`);
                    
                    inscriptions.forEach((inscription, index) => {
                        console.log(`      📝 Inscription ${index + 1}: ${inscription.type} - Output ${inscription.outputIndex}`);
                        if (inscription.address) {
                            console.log(`         Address: ${inscription.address}`);
                        }
                        if (inscription.value) {
                            console.log(`         Value: ${inscription.value} BTC`);
                        }
                    });
                }
            }
            
            if (inscriptionCount > 0) {
                console.log(`   🎯 Total inscriptions found in block: ${inscriptionCount}`);
            } else {
                console.log(`   📭 No inscriptions found in this block`);
            }
        }
        
        console.log(`   ✅ Block ${height} processed`);
        
    } catch (error) {
        console.error(`❌ Error processing block ${height}:`, error.message);
    }
}

// Show current network status
async function showNetworkStatus() {
    console.log('🌐 Signet Network Status');
    console.log('========================\n');
    
    try {
        const blockchainInfo = await getBlockchainInfo();
        if (blockchainInfo) {
            console.log(`📊 Current Block: ${blockchainInfo.blocks}`);
            console.log(`📈 Headers: ${blockchainInfo.headers}`);
            console.log(`🔗 Chain: ${blockchainInfo.chain}`);
            console.log(`📏 Size on Disk: ${(blockchainInfo.size_on_disk / 1024 / 1024 / 1024).toFixed(2)} GB`);
            console.log(`⏳ Verification Progress: ${(blockchainInfo.verificationprogress * 100).toFixed(2)}%`);
        }
        
        // Get recent block info
        const recentBlock = await getBlockByHeight(blockchainInfo.blocks);
        if (recentBlock) {
            console.log(`\n🕒 Latest Block Time: ${new Date(recentBlock.time * 1000).toLocaleString()}`);
            console.log(`💰 Latest Block Transactions: ${recentBlock.transactions ? recentBlock.transactions.length : 0}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to get network status:', error.message);
    }
    
    console.log('');
}

// Main function
async function main() {
    console.log('🚀 BRC-20 Inscription Monitor');
    console.log('==============================\n');
    
    try {
        // Show initial network status
        await showNetworkStatus();
        
        // Start monitoring
        await monitorNewBlocks();
        
    } catch (error) {
        console.error('❌ Monitor failed:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down inscription monitor...');
    process.exit(0);
});

// Check if axios is available
try {
    require('axios');
} catch (error) {
    console.error('❌ axios is not installed. Please install it first:');
    console.error('   npm install axios');
    process.exit(1);
}

// Start the monitor
main();
