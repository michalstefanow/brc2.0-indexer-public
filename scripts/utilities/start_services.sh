#!/bin/bash

# OPI & BRC20 Programmable Module Startup Script
# This script starts all services in the correct order

set -e

echo "🚀 Starting OPI & BRC20 Programmable Module Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is running
check_postgres() {
    print_status "Checking PostgreSQL status..."
    if sudo systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running. Starting it..."
        sudo systemctl start postgresql
        sleep 2
        if sudo systemctl is-active --quiet postgresql; then
            print_success "PostgreSQL started successfully"
        else
            print_error "Failed to start PostgreSQL"
            exit 1
        fi
    fi
}

# Check if Bitcoin Core is running
check_bitcoin() {
    print_status "Checking Bitcoin Core RPC connection..."
    if curl -s --user bitcoinuser:bitcoinpassword --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getblockchaininfo", "params": []}' -H 'content-type: text/plain;' http://localhost:38332/ > /dev/null 2>&1; then
        print_success "Bitcoin Core RPC is accessible"
    else
        print_warning "Bitcoin Core RPC is not accessible on localhost:38332"
        print_warning "Please ensure Bitcoin Core is running with:"
        echo "    bitcoin-core.daemon -signet -txindex=1 -rpcuser=bitcoinuser -rpcpassword=bitcoinpassword -rpcport=38332"
        echo ""
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Set environment variables
setup_env() {
    print_status "Setting up environment variables..."
    export DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/postgres
    print_success "Environment variables set"
}

# Start BRC20 Programmable Module Server
start_brc20_prog() {
    print_status "Starting BRC20 Programmable Module Server..."
    
    cd /root/brc20-indexer/brc20-programmable-module
    
    # Check if server is already running
    if pgrep -f "server" > /dev/null; then
        print_warning "BRC20 Programmable Module Server is already running"
        return 0
    fi
    
    # Start server in background
    nohup ./target/release/server > brc20_prog.log 2>&1 &
    SERVER_PID=$!
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if server started successfully
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "BRC20 Programmable Module Server started (PID: $SERVER_PID)"
        echo $SERVER_PID > brc20_prog.pid
    else
        print_error "Failed to start BRC20 Programmable Module Server"
        exit 1
    fi
}

# Start Main Meta-Protocol Indexer (ord)
start_ord() {
    print_status "Starting Main Meta-Protocol Indexer (ord)..."
    
    cd /root/brc20-indexer/OPI/ord/target/release
    
    # Check if ord is already running
    if pgrep -f "ord.*index run" > /dev/null; then
        print_warning "Main Meta-Protocol Indexer is already running"
        return 0
    fi
    
    # Start ord in background
    nohup ./ord --signet --bitcoin-rpc-url=http://localhost:38332 --bitcoin-rpc-username=bitcoinuser --bitcoin-rpc-password=bitcoinpassword --data-dir . index run > ord.log 2>&1 &
    ORD_PID=$!
    
    # Wait a moment for ord to start
    sleep 3
    
    # Check if ord started successfully
    if kill -0 $ORD_PID 2>/dev/null; then
        print_success "Main Meta-Protocol Indexer started (PID: $ORD_PID)"
        echo $ORD_PID > ord.pid
    else
        print_error "Failed to start Main Meta-Protocol Indexer"
        exit 1
    fi
}

# Start BRC20 Indexer
start_brc20_index() {
    print_status "Starting BRC20 Indexer..."
    
    cd /root/brc20-indexer/OPI/modules/brc20_index
    
    # Check if BRC20 indexer is already running
    if pgrep -f "brc20-index" > /dev/null; then
        print_warning "BRC20 Indexer is already running"
        return 0
    fi
    
    # Activate virtual environment
    source /root/brc20-indexer/OPI/modules/.venv/bin/activate
    
    # Start BRC20 indexer in background
    nohup ./target/release/brc20-index > brc20_index.log 2>&1 &
    BRC20_PID=$!
    
    # Wait a moment for indexer to start
    sleep 3
    
    # Check if indexer started successfully
    if kill -0 $BRC20_PID 2>/dev/null; then
        print_success "BRC20 Indexer started (PID: $BRC20_PID)"
        echo $BRC20_PID > brc20_index.pid
    else
        print_error "Failed to start BRC20 Indexer"
        exit 1
    fi
}

# Start Optional APIs
start_apis() {
    print_status "Starting Optional APIs..."
    
    # Start BRC20 API
    cd /root/brc20-indexer/OPI/modules/brc20_api
    if ! pgrep -f "node.*api.js" > /dev/null; then
        nohup node api.js > brc20_api.log 2>&1 &
        echo $! > brc20_api.pid
        print_success "BRC20 API started"
    else
        print_warning "BRC20 API is already running"
    fi
    
    # Start Bitmap API
    cd /root/brc20-indexer/OPI/modules/bitmap_api
    if ! pgrep -f "node.*api.js" > /dev/null; then
        nohup node api.js > bitmap_api.log 2>&1 &
        echo $! > bitmap_api.pid
        print_success "Bitmap API started"
    else
        print_warning "Bitmap API is already running"
    fi
    
    # Start SNS API
    cd /root/brc20-indexer/OPI/modules/sns_api
    if ! pgrep -f "node.*api.js" > /dev/null; then
        nohup node api.js > sns_api.log 2>&1 &
        echo $! > sns_api.pid
        print_success "SNS API started"
    else
        print_warning "SNS API is already running"
    fi
    
    # Start POW20 API
    cd /root/brc20-indexer/OPI/modules/pow20_api
    if ! pgrep -f "node.*api.js" > /dev/null; then
        nohup node api.js > pow20_api.log 2>&1 &
        echo $! > pow20_api.pid
        print_success "POW20 API started"
    else
        print_warning "POW20 API is already running"
    fi
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo ""
    
    # Check BRC20 Programmable Module
    if [ -f "/root/brc20-indexer/brc20-programmable-module/brc20_prog.pid" ]; then
        PID=$(cat /root/brc20-indexer/brc20-programmable-module/brc20_prog.pid)
        if kill -0 $PID 2>/dev/null; then
            print_success "BRC20 Programmable Module: Running (PID: $PID)"
        else
            print_error "BRC20 Programmable Module: Not running (stale PID file)"
        fi
    else
        print_error "BRC20 Programmable Module: Not running"
    fi
    
    # Check ord
    if [ -f "/root/brc20-indexer/OPI/ord/target/release/ord.pid" ]; then
        PID=$(cat /root/brc20-indexer/OPI/ord/target/release/ord.pid)
        if kill -0 $PID 2>/dev/null; then
            print_success "Main Meta-Protocol Indexer: Running (PID: $PID)"
        else
            print_error "Main Meta-Protocol Indexer: Not running (stale PID file)"
        fi
    else
        print_error "Main Meta-Protocol Indexer: Not running"
    fi
    
    # Check BRC20 Indexer
    if [ -f "/root/brc20-indexer/OPI/modules/brc20_index/brc20_index.pid" ]; then
        PID=$(cat /root/brc20-indexer/OPI/modules/brc20_index/brc20_index.pid)
        if kill -0 $PID 2>/dev/null; then
            print_success "BRC20 Indexer: Running (PID: $PID)"
        else
            print_error "BRC20 Indexer: Not running (stale PID file)"
        fi
    else
        print_error "BRC20 Indexer: Not running"
    fi
    
    # Check APIs
    cd /root/brc20-indexer/OPI/modules
    for api in brc20_api bitmap_api sns_api pow20_api; do
        if [ -f "$api/${api}.pid" ]; then
            PID=$(cat "$api/${api}.pid")
            if kill -0 $PID 2>/dev/null; then
                print_success "$(echo $api | tr '[:lower:]' '[:upper:]'): Running (PID: $PID)"
            else
                print_error "$(echo $api | tr '[:lower:]' '[:upper:]'): Not running (stale PID file)"
            fi
        else
            print_error "$(echo $api | tr '[:lower:]' '[:upper:]'): Not running"
        fi
    done
    
    echo ""
    print_status "Log files are available in each service directory"
}

# Main execution
main() {
    echo "=========================================="
    echo "  OPI & BRC20 Programmable Module"
    echo "           Startup Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_postgres
    check_bitcoin
    setup_env
    
    # Start services in order
    start_brc20_prog
    start_ord
    start_brc20_index
    start_apis
    
    echo ""
    print_success "All services started successfully!"
    echo ""
    
    # Show status
    show_status
    
    echo ""
    print_status "To stop all services, run: ./stop_services.sh"
    print_status "To view logs, check the .log files in each service directory"
    print_status "For more information, see STARTUP_GUIDE.md"
}

# Run main function
main "$@"
