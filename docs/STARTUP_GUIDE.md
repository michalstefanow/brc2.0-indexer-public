# OPI & BRC20 Programmable Module - Startup Guide

## Installation Status ✅

All components have been successfully installed and built:

### ✅ OPI (Open Protocol Indexer)
- **ord binary**: Built successfully (main meta-protocol indexer)
- **BRC20 indexer**: Built successfully 
- **Node.js APIs**: All dependencies installed (brc20_api, bitmap_api, pow20_api, sns_api)
- **Python modules**: Virtual environment created with all dependencies
- **Databases**: PostgreSQL configured and ready

### ✅ BRC20 Programmable Module
- **Server binary**: Built successfully with server features
- **Environment**: Configured for regtest network
- **Dependencies**: All Rust dependencies compiled

## Prerequisites

Before starting services, ensure you have:

1. **Bitcoin Core** running with RPC enabled
2. **PostgreSQL** running (already started)
3. **Environment variables** set (already configured)

## Service Startup Order

### 1. Start Bitcoin Core (if not already running)
```bash
# For regtest network
bitcoin-core.daemon -regtest -txindex=1 -rpcuser=user -rpcpassword=password -rpcport=38332
```

### 2. Start BRC20 Programmable Module Server
```bash
cd /root/brc20-indexer/brc20-programmable-module
source .env  # Load environment variables
./target/release/server
```
**Expected output**: Server should start and listen on port 18545

### 3. Start Main Meta-Protocol Indexer (ord)
```bash
cd /root/brc20-indexer/OPI/ord/target/release
export DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/postgres
./ord --regtest --bitcoin-rpc-url=http://localhost:38332 --bitcoin-rpc-username=user --bitcoin-rpc-password=password --data-dir . index run
```
**Expected output**: Indexer should start and begin processing blocks

### 4. Start BRC20 Indexer
```bash
cd /root/brc20-indexer/OPI/modules/brc20_index
source .venv/bin/activate
export DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/postgres
./target/release/brc20-index
```
**Expected output**: BRC20 indexer should start and connect to the programmable module

### 5. Start Optional APIs (in separate terminals)
```bash
# BRC20 API
cd /root/brc20-indexer/OPI/modules/brc20_api
node api.js

# Bitmap API  
cd /root/brc20-indexer/OPI/modules/bitmap_api
node api.js

# SNS API
cd /root/brc20-indexer/OPI/modules/sns_api
node api.js

# POW20 API
cd /root/brc20-indexer/OPI/modules/pow20_api
node api.js
```

## Environment Configuration

### Database Connection
```bash
export DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/postgres
```

### BRC20 Programmable Module
- **RPC Server**: http://localhost:18545
- **Balance Server**: http://localhost:18546
- **Network**: regtest
- **Bitcoin RPC**: http://localhost:38332

## Testing the Installation

### 1. Test BRC20 Programmable Module
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:18545
```

### 2. Test BRC20 Indexer
```bash
# Check if indexer is running and processing
ps aux | grep brc20-index
```

### 3. Test Database Connection
```bash
sudo -u postgres psql -c "SELECT version();"
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Check if services are already running
   ```bash
   netstat -tlnp | grep :18545
   netstat -tlnp | grep :38332
   ```

2. **Database connection failed**: Ensure PostgreSQL is running
   ```bash
   sudo systemctl status postgresql
   ```

3. **Bitcoin RPC connection failed**: Check Bitcoin Core is running and RPC is enabled

4. **Permission denied**: Ensure you're running with proper permissions

### Logs and Debugging

- **ord logs**: Check terminal output for indexing progress
- **BRC20 indexer logs**: Check terminal output for BRC20 processing
- **Programmable module logs**: Check terminal output for EVM execution

## Network Configuration

### Regtest (Local Development)
- **Bitcoin RPC**: localhost:38332
- **BRC20 Prog RPC**: localhost:18545
- **BRC20 Balance Server**: localhost:18546

### Mainnet (Production)
- **Bitcoin RPC**: Configure your Bitcoin node
- **BRC20 Prog RPC**: localhost:18545
- **BRC20 Balance Server**: localhost:18546

## Next Steps

1. **Start Bitcoin Core** with regtest network
2. **Initialize the programmable module** with genesis block
3. **Start the indexers** in the correct order
4. **Test the APIs** to ensure everything is working
5. **Monitor logs** for any errors or issues

## Support

- **OPI Documentation**: Check the INSTALL.ubuntu.md file
- **BRC20 Programmable Module**: Check the README.md file
- **Issues**: Check GitHub repositories for known issues

---

**Installation completed successfully!** 🎉

All components are built and ready to run. Follow the startup order above to get your indexing system operational.
