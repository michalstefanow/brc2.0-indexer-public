#!/bin/bash

# Monitor Indexers Script
# This script provides real-time monitoring of all Bitcoin indexers

echo "🔍 Bitcoin Indexer Monitoring Dashboard"
echo "======================================"
echo ""

# Function to show current status
show_status() {
    echo "📊 Current Status:"
    echo "------------------"
    
    # Bitcoin Core status
    echo "🟢 Bitcoin Core:"
    bitcoin_info=$(curl -s --user bitcoinuser:bitcoinpassword --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getblockchaininfo", "params": []}' -H 'content-type: text/plain;' http://localhost:38332/ 2>/dev/null)
    if [ $? -eq 0 ]; then
        current_block=$(echo "$bitcoin_info" | jq -r '.result.blocks // "N/A"')
        headers=$(echo "$bitcoin_info" | jq -r '.result.headers // "N/A"')
        progress=$(echo "$bitcoin_info" | jq -r '.result.verificationprogress // "N/A"')
        echo "   Current Block: $current_block"
        echo "   Headers: $headers"
        echo "   Sync Progress: $(echo "$progress * 100" | bc -l | cut -c1-6)%"
    else
        echo "   ❌ Not accessible"
    fi
    
    echo ""
    
    # Process status
    echo "🔄 Running Processes:"
    echo "   ord (Main Indexer): $(ps aux | grep "ord" | grep -v grep | wc -l | tr -d ' ') processes"
    echo "   BRC20 Indexer: $(ps aux | grep "brc20-index" | grep -v grep | wc -l | tr -d ' ') processes"
    echo "   BRC20 Programmable Module: $(ps aux | grep "target/release/server" | grep -v grep | wc -l | tr -d ' ') processes"
    echo "   Bitcoin Core: $(ps aux | grep "bitcoind" | grep -v grep | wc -l | tr -d ' ') processes"
    
    echo ""
}

# Function to show recent activity
show_recent_activity() {
    echo "📝 Recent Activity:"
    echo "-------------------"
    
    # Check ord logs
    if [ -f "/root/brc20-indexer/OPI/ord/target/release/ord.log" ]; then
        echo "🟡 ord (Main Indexer) - Last 5 lines:"
        tail -5 /root/brc20-indexer/OPI/ord/target/release/ord.log | sed 's/^/   /'
        echo ""
    fi
    
    # Check BRC20 indexer logs
    if [ -f "/root/brc20-indexer/OPI/modules/brc20_index/brc20_index.log" ]; then
        log_size=$(stat -c%s "/root/brc20-indexer/OPI/modules/brc20_index/brc20_index.log" 2>/dev/null || echo "0")
        if [ "$log_size" -gt 0 ]; then
            echo "🟢 BRC20 Indexer - Last 5 lines:"
            tail -5 /root/brc20-indexer/OPI/modules/brc20_index/brc20_index.log | sed 's/^/   /'
        else
            echo "🟡 BRC20 Indexer - Log file exists but empty (waiting for BRC-20 inscriptions)"
        fi
        echo ""
    fi
    
    # Check BRC20 programmable module
    echo "🔵 BRC20 Programmable Module:"
    prog_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:18545 2>/dev/null)
    if [ $? -eq 0 ]; then
        block_num=$(echo "$prog_response" | jq -r '.result // "N/A"')
        echo "   Current Block: $block_num"
        echo "   Status: ✅ Responding"
    else
        echo "   Status: ❌ Not responding"
    fi
    echo ""
}

# Function to show network activity
show_network_activity() {
    echo "🌐 Network Activity:"
    echo "-------------------"
    
    # Check if new blocks are coming
    bitcoin_info=$(curl -s --user bitcoinuser:bitcoinpassword --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getblockchaininfo", "params": []}' -H 'content-type: text/plain;' http://localhost:38332/ 2>/dev/null)
    if [ $? -eq 0 ]; then
        current_block=$(echo "$bitcoin_info" | jq -r '.result.blocks // "N/A"')
        echo "   Current Bitcoin Block: $current_block"
        
        # Check if there are new blocks
        if [ -f "/tmp/last_block" ]; then
            last_block=$(cat /tmp/last_block)
            if [ "$current_block" != "$last_block" ]; then
                echo "   🆕 New blocks detected! Indexers should be processing..."
                echo "$current_block" > /tmp/last_block
            else
                echo "   ⏳ Waiting for new blocks..."
            fi
        else
            echo "$current_block" > /tmp/last_block
            echo "   📍 Monitoring started at block $current_block"
        fi
    else
        echo "   ❌ Cannot access Bitcoin Core"
    fi
    
    echo ""
}

# Function to show API status
show_api_status() {
    echo "🔌 API Status:"
    echo "--------------"
    
    # BRC20 API
    echo "   BRC20 API (port 8000):"
    api_response=$(curl -s http://localhost:8000/ 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "      ✅ Running (responds to requests)"
    else
        echo "      ❌ Not responding"
    fi
    
    # BRC20 Programmable Module RPC
    echo "   BRC20 Programmable Module RPC (port 18545):"
    rpc_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:18545 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "      ✅ Running (RPC responding)"
    else
        echo "      ❌ RPC not responding"
    fi
    
    echo ""
}

# Function to show resource usage
show_resource_usage() {
    echo "💾 Resource Usage:"
    echo "------------------"
    
    # CPU and Memory usage
    echo "   ord (Main Indexer):"
    ord_pid=$(ps aux | grep "ord" | grep -v grep | awk '{print $2}' | head -1)
    if [ ! -z "$ord_pid" ]; then
        ord_cpu=$(ps -p $ord_pid -o %cpu --no-headers 2>/dev/null || echo "N/A")
        ord_mem=$(ps -p $ord_pid -o %mem --no-headers 2>/dev/null || echo "N/A")
        echo "      CPU: ${ord_cpu}% | Memory: ${ord_mem}%"
    else
        echo "      Process not found"
    fi
    
    echo "   BRC20 Indexer:"
    brc20_pid=$(ps aux | grep "brc20-index" | grep -v grep | awk '{print $2}' | head -1)
    if [ ! -z "$brc20_pid" ]; then
        brc20_cpu=$(ps -p $brc20_pid -o %cpu --no-headers 2>/dev/null || echo "N/A")
        brc20_mem=$(ps -p $brc20_pid -o %mem --no-headers 2>/dev/null || echo "N/A")
        echo "      CPU: ${brc20_cpu}% | Memory: ${brc20_mem}%"
    else
        echo "      Process not found"
    fi
    
    echo ""
}

# Main monitoring loop
main() {
    while true; do
        clear
        echo "🔍 Bitcoin Indexer Monitoring Dashboard"
        echo "======================================"
        echo "Last updated: $(date)"
        echo "Press Ctrl+C to exit"
        echo ""
        
        show_status
        show_recent_activity
        show_network_activity
        show_api_status
        show_resource_usage
        
        echo "⏰ Next update in 10 seconds..."
        sleep 10
    done
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is not installed. Please install it first:"
    echo "   sudo apt update && sudo apt install -y jq"
    exit 1
fi

# Check if bc is installed
if ! command -v bc &> /dev/null; then
    echo "❌ Error: bc is not installed. Please install it first:"
    echo "   sudo apt update && sudo apt install -y bc"
    exit 1
fi

# Start monitoring
echo "🚀 Starting Bitcoin Indexer Monitoring..."
echo "This will update every 10 seconds. Press Ctrl+C to stop."
echo ""
sleep 2

main
