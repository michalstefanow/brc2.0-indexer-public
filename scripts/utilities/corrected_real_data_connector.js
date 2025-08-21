#!/usr/bin/env node

// Corrected Real Data Connector
// This uses the actual database schema from your BRC-20 indexer

const { Client } = require('pg');
const axios = require('axios');

// Configuration
const CONFIG = {
    DATABASE: {
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'postgres123'
    },
    SMART_CONTRACT_RPC: 'http://localhost:18545',
    BITCOIN_RPC: 'http://localhost:38332',
    BITCOIN_RPC_USER: 'bitcoinuser',
    BITCOIN_RPC_PASS: 'bitcoinpassword'
};

class CorrectedRealDataConnector {
    constructor() {
        this.dbClient = null;
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    async connectDatabase() {
        try {
            this.dbClient = new Client(CONFIG.DATABASE);
            await this.dbClient.connect();
            console.log('✅ Connected to PostgreSQL database');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    async disconnectDatabase() {
        if (this.dbClient) {
            await this.dbClient.end();
            console.log('✅ Disconnected from database');
        }
    }

    // Get real BRC-20 token data using correct schema
    async getRealBRC20Tokens() {
        try {
            if (!this.dbClient) {
                console.log('⚠️  Database not connected, skipping token fetch');
                return [];
            }

            console.log('🔍 Fetching real BRC-20 tokens from database...');
            
            // Using correct column names from the schema
            const query = `
                SELECT 
                    tick,
                    max_supply,
                    remaining_supply,
                    burned_supply,
                    decimals,
                    block_height
                FROM brc20_tickers 
                ORDER BY block_height DESC 
                LIMIT 10
            `;
            
            const result = await this.dbClient.query(query);
            
            if (result.rows && result.rows.length > 0) {
                console.log(`✅ Found ${result.rows.length} real BRC-20 tokens`);
                return result.rows.map(token => ({
                    tick: token.tick,
                    maxSupply: parseFloat(token.max_supply),
                    remainingSupply: parseFloat(token.remaining_supply),
                    burnedSupply: parseFloat(token.burned_supply),
                    decimals: token.decimals,
                    blockHeight: token.block_height,
                    // In production, you'd get real prices from exchanges
                    price: this.getMockPrice(token.tick),
                    change: this.getMockChange(token.tick),
                    volume: this.getMockVolume(token.tick)
                }));
            }
            
            return [];
        } catch (error) {
            console.error('❌ Error fetching real BRC-20 tokens:', error.message);
            return [];
        }
    }

    // Get real inscription data using correct schema
    async getRealInscriptions() {
        try {
            if (!this.dbClient) {
                console.log('⚠️  Database not connected, skipping inscription fetch');
                return [];
            }

            console.log('🔍 Fetching real inscription data...');
            
            // Using correct schema - event data is stored in JSONB
            const query = `
                SELECT 
                    event_type,
                    block_height,
                    inscription_id,
                    inscription_number,
                    event,
                    txid
                FROM brc20_events 
                ORDER BY block_height DESC 
                LIMIT 20
            `;
            
            const result = await this.dbClient.query(query);
            
            if (result.rows && result.rows.length > 0) {
                console.log(`✅ Found ${result.rows.length} real inscriptions`);
                return result.rows.map(event => {
                    const eventData = event.event;
                    const tick = eventData.tick || 'Unknown';
                    const amount = eventData.amt || '0';
                    
                    return {
                        type: this.mapEventType(event.event_type),
                        token: tick,
                        block: event.block_height,
                        inscriptionId: event.inscription_id,
                        inscriptionNumber: event.inscription_number,
                        time: this.formatTimeFromBlock(event.block_height),
                        details: `${amount} ${tick} ${this.mapEventType(event.event_type)}`,
                        new: this.isRecentBlock(event.block_height),
                        txid: event.txid
                    };
                });
            }
            
            return [];
        } catch (error) {
            console.error('❌ Error fetching real inscriptions:', error.message);
            return [];
        }
    }

    // Get event type counts for statistics
    async getEventTypeStats() {
        try {
            if (!this.dbClient) {
                return {};
            }

            const query = `
                SELECT 
                    event_type,
                    COUNT(*) as count
                FROM brc20_events 
                GROUP BY event_type
                ORDER BY count DESC
            `;
            
            const result = await this.dbClient.query(query);
            
            const stats = {};
            result.rows.forEach(row => {
                const eventType = this.mapEventType(row.event_type);
                stats[eventType] = parseInt(row.count);
            });
            
            return stats;
        } catch (error) {
            console.error('❌ Error getting event type stats:', error.message);
            return {};
        }
    }

    // Get real smart contract data from your programmable module
    async getRealSmartContractData() {
        try {
            console.log('🔍 Fetching real smart contract data...');
            
            const response = await axios.post(CONFIG.SMART_CONTRACT_RPC, {
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
            });
            
            if (response.data && response.data.result) {
                const blockNumber = parseInt(response.data.result, 16);
                console.log(`✅ Smart contract block: ${blockNumber}`);
                
                return {
                    currentBlock: blockNumber,
                    status: 'Online',
                    contracts: await this.getDeployedContracts()
                };
            }
            
            return { currentBlock: 0, status: 'Offline', contracts: [] };
        } catch (error) {
            console.error('❌ Error fetching smart contract data:', error.message);
            return { currentBlock: 0, status: 'Offline', contracts: [] };
        }
    }

    // Get real Bitcoin network data
    async getRealBitcoinData() {
        try {
            console.log('🔍 Fetching real Bitcoin network data...');
            
            const response = await axios.post(CONFIG.BITCOIN_RPC, {
                jsonrpc: '1.0',
                id: 'curltest',
                method: 'getblockchaininfo',
                params: []
            }, {
                auth: {
                    username: CONFIG.BITCOIN_RPC_USER,
                    password: CONFIG.BITCOIN_RPC_PASS
                }
            });
            
            if (response.data && response.data.result) {
                const data = response.data.result;
                console.log(`✅ Bitcoin block: ${data.blocks}`);
                
                return {
                    currentBlock: data.blocks,
                    headers: data.headers,
                    verificationProgress: data.verificationprogress,
                    chain: data.chain,
                    sizeOnDisk: data.size_on_disk
                };
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error fetching Bitcoin data:', error.message);
            return null;
        }
    }

    // Get database statistics
    async getDatabaseStats() {
        try {
            if (!this.dbClient) {
                return { totalEvents: 0, totalTokens: 0 };
            }

            const eventsQuery = 'SELECT COUNT(*) as count FROM brc20_events';
            const tokensQuery = 'SELECT COUNT(*) as count FROM brc20_tickers';
            
            const [eventsResult, tokensResult] = await Promise.all([
                this.dbClient.query(eventsQuery),
                this.dbClient.query(tokensQuery)
            ]);
            
            return {
                totalEvents: parseInt(eventsResult.rows[0].count),
                totalTokens: parseInt(tokensResult.rows[0].count)
            };
        } catch (error) {
            console.error('❌ Error getting database stats:', error.message);
            return { totalEvents: 0, totalTokens: 0 };
        }
    }

    // Helper functions for data formatting
    mapEventType(eventType) {
        const typeMap = {
            0: 'Deploy',
            1: 'Mint',
            2: 'Transfer'
        };
        return typeMap[eventType] || `Unknown(${eventType})`;
    }

    formatTimeFromBlock(blockHeight) {
        // Estimate time based on block height difference from current
        // In production, you'd store actual timestamps
        const currentBlock = 266034; // From your monitoring
        const blockDiff = currentBlock - blockHeight;
        const estimatedMinutes = blockDiff * 10; // Rough estimate: 10 minutes per block
        
        if (estimatedMinutes < 1) return 'Just now';
        if (estimatedMinutes < 60) return `${Math.floor(estimatedMinutes)} min ago`;
        return `${Math.floor(estimatedMinutes / 60)} hours ago`;
    }

    isRecentBlock(blockHeight) {
        const currentBlock = 266034;
        return (currentBlock - blockHeight) <= 3; // Within last 3 blocks
    }

    // Mock price functions (replace with real exchange APIs)
    getMockPrice(tick) {
        const prices = {
            'ORDI': 0.00045,
            'SATS': 0.000023,
            'MEME': 0.00012,
            'BTC': 1.0
        };
        return prices[tick] || 0.0001;
    }

    getMockChange(tick) {
        const changes = {
            'ORDI': 5.2,
            'SATS': -2.1,
            'MEME': 12.5,
            'BTC': 0.0
        };
        return changes[tick] || 0.0;
    }

    getMockVolume(tick) {
        const volumes = {
            'ORDI': 1250.5,
            'SATS': 890.2,
            'MEME': 456.8,
            'BTC': 98.9
        };
        return volumes[tick] || 100.0;
    }

    async getDeployedContracts() {
        // This would query your smart contract system
        // For now, return empty array
        return [];
    }

    // Main function to get all real data
    async getAllRealData() {
        console.log('🚀 Fetching all real data from your Bitcoin ecosystem...\n');
        
        // Connect to database first
        const dbConnected = await this.connectDatabase();
        
        try {
            const [tokens, inscriptions, smartContracts, bitcoin, dbStats, eventStats] = await Promise.all([
                this.getRealBRC20Tokens(),
                this.getRealInscriptions(),
                this.getRealSmartContractData(),
                this.getRealBitcoinData(),
                this.getDatabaseStats(),
                this.getEventTypeStats()
            ]);
            
            console.log('\n📊 Real Data Summary:');
            console.log(`   BRC-20 Tokens: ${tokens.length}`);
            console.log(`   Recent Inscriptions: ${inscriptions.length}`);
            console.log(`   Smart Contract Block: ${smartContracts.currentBlock}`);
            console.log(`   Bitcoin Block: ${bitcoin?.currentBlock || 'Unknown'}`);
            console.log(`   Database Events: ${dbStats.totalEvents}`);
            console.log(`   Database Tokens: ${dbStats.totalTokens}`);
            
            console.log('\n📈 Event Type Breakdown:');
            Object.entries(eventStats).forEach(([type, count]) => {
                console.log(`   ${type}: ${count.toLocaleString()}`);
            });
            
            return {
                tokens,
                inscriptions,
                smartContracts,
                bitcoin,
                dbStats,
                eventStats
            };
        } finally {
            // Always disconnect from database
            await this.disconnectDatabase();
        }
    }
}

// Usage example
async function main() {
    try {
        const connector = new CorrectedRealDataConnector();
        const realData = await connector.getAllRealData();
        
        console.log('\n🌟 Next Steps to Integrate Real Data:');
        console.log('   1. ✅ PostgreSQL client installed');
        console.log('   2. ✅ Database schema corrected');
        console.log('   3. Replace mock price functions with real exchange APIs');
        console.log('   4. Update your dApps to use this connector');
        console.log('   5. Add real-time WebSocket connections for live updates');
        
        // Show sample of real data
        if (realData.tokens.length > 0) {
            console.log('\n📋 Sample Real Token Data:');
            realData.tokens.slice(0, 3).forEach(token => {
                console.log(`   ${token.tick}: Max Supply: ${token.maxSupply.toLocaleString()}, Remaining: ${token.remainingSupply.toLocaleString()}`);
            });
        }
        
        if (realData.inscriptions.length > 0) {
            console.log('\n📋 Sample Real Inscription Data:');
            realData.inscriptions.slice(0, 3).forEach(inscription => {
                console.log(`   ${inscription.type} ${inscription.token}: Block ${inscription.block}, Inscription #${inscription.inscriptionNumber}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error in main:', error.message);
    }
}

// Run the connector
main();

