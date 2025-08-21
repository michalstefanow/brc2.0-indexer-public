# 🚀 BRC20 Indexer & Programmable Module

**World-class Bitcoin indexing system with EVM-compatible smart contract execution**

## 📁 **Organized File Structure**

```
brc20-indexer/
├── 📚 docs/                          # Documentation & guides
├── 🛠️  scripts/                      # All utility scripts
│   ├── deployment/                   # Contract deployment scripts
│   ├── testing/                      # Testing & validation scripts  
│   ├── defi/                         # DeFi application examples
│   └── utilities/                    # System utilities & monitoring
├── 🎯 examples/                      # HTML examples & demos
├── 🏗️  OPI/                          # Open Protocol Indexer
├── ⚡ brc20-programmable-module/     # EVM execution engine
└── 📦 node_modules/                  # Dependencies
```

## 🚀 **Quick Start**

### **1. Start All Services**
```bash
cd scripts/utilities
./start_services.sh
```

### **2. Test System Health**
```bash
cd scripts/testing
node test_full_integration.js
```

### **3. Deploy Smart Contracts**
```bash
cd scripts/deployment
node deploy_smart_contract.js
```

## 🎯 **Key Components**

### **✅ BRC20 Programmable Module**
- **EVM Execution Engine** - Full Solidity contract support
- **JSON-RPC API** - Standard Ethereum RPC methods
- **Smart Contract Deployment** - Via Bitcoin inscriptions
- **Real-time Processing** - Automatic EVM execution

### **✅ BRC20 Indexer**
- **Multi-protocol Support** - BRC20, Bitmap, SNS, POW20
- **Programmable Integration** - Automatic inscription processing
- **Database Storage** - PostgreSQL with full transaction history
- **Reorg Protection** - Built-in blockchain reorganization protection

### **✅ DeFi Capabilities**
- **Lending Protocols** - Complete lending/borrowing systems
- **DEX Applications** - Decentralized exchange functionality
- **Yield Farming** - Automated yield optimization
- **Smart Contract Templates** - Ready-to-deploy contracts

## 📋 **Script Categories**

### **🚀 Deployment Scripts** (`scripts/deployment/`)
- `deploy_smart_contract.js` - Smart contract deployment
- `deploy_contract.js` - Contract deployment utilities
- `deploy_contract_complete.js` - Full deployment workflow

### **🧪 Testing Scripts** (`scripts/testing/`)
- `test_full_integration.js` - Complete system testing
- `test_contract_interactions.js` - Contract interaction testing
- `test_rpc.js` - RPC method validation
- `test_smart_contract.js` - Smart contract testing

### **🏦 DeFi Scripts** (`scripts/defi/`)
- `defi_lending_app.js` - Complete lending protocol
- `inscription_processor.js` - Inscription processing demo

### **🛠️ Utility Scripts** (`scripts/utilities/`)
- `simple_balance_server.js` - BRC20 balance server
- `monitor_inscriptions.js` - Real-time inscription monitoring
- `corrected_real_data_connector.js` - Database connector
- `start_services.sh` - Service management
- `stop_services.sh` - Service shutdown
- `test_installation.sh` - System health checks

## 🌐 **Service Endpoints**

- **BRC20 Programmable Module RPC**: `http://localhost:18545`
- **BRC20 Balance Server**: `http://localhost:18546`
- **Bitcoin RPC**: `http://localhost:38332`
- **PostgreSQL Database**: `localhost:5432`

## 🎯 **Development Workflow**

### **1. Smart Contract Development**
```bash
cd scripts/deployment
# Write Solidity contract
# Compile to bytecode
# Deploy via Bitcoin inscription
```

### **2. Testing & Validation**
```bash
cd scripts/testing
# Test RPC methods
# Validate contract interactions
# Check system integration
```

### **3. DeFi Application Building**
```bash
cd scripts/defi
# Deploy lending protocols
# Build DEX applications
# Create yield farming systems
```

## 📚 **Documentation**

- **Installation Guide**: `docs/INSTALLATION_SUMMARY.md`
- **Startup Guide**: `docs/STARTUP_GUIDE.md`
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`

## 🚀 **What You Can Build**

- **DeFi Protocols** - Lending, borrowing, trading
- **NFT Marketplaces** - Bitcoin-native NFT trading
- **DAO Governance** - Decentralized autonomous organizations
- **Cross-chain Bridges** - Bitcoin to other blockchains
- **Gaming Applications** - Blockchain-based games
- **Supply Chain Solutions** - Traceability and verification

## 🔧 **Troubleshooting**

### **Service Issues**
```bash
cd scripts/utilities
./test_installation.sh
```

### **Logs & Debugging**
```bash
# Check BRC20 indexer logs
tail -f OPI/modules/brc20_index/brc20_index.log

# Check programmable module logs
tail -f brc20-programmable-module/server.log
```

## 🌟 **Key Features**

- ✅ **Production Ready** - Enterprise-grade infrastructure
- ✅ **EVM Compatible** - Full Solidity contract support
- ✅ **Real-time Processing** - Instant inscription processing
- ✅ **Multi-protocol** - BRC20, Bitmap, SNS, POW20
- ✅ **Reorg Protected** - Built-in blockchain safety
- ✅ **Scalable** - Modular architecture for growth

---

**🎉 Your BRC20 Programmable Module is ready for production DeFi development!**
