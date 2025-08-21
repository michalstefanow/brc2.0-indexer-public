#!/bin/bash

# OPI & BRC20 Programmable Module Stop Script
# This script stops all services gracefully

set -e

echo "🛑 Stopping OPI & BRC20 Programmable Module Services..."

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

# Stop service by PID file
stop_service() {
    local service_name="$1"
    local pid_file="$2"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            print_status "Stopping $service_name (PID: $pid)..."
            kill $pid
            
            # Wait for graceful shutdown
            local count=0
            while kill -0 $pid 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                print_warning "Force killing $service_name (PID: $pid)..."
                kill -9 $pid
            fi
            
            rm -f "$pid_file"
            print_success "$service_name stopped"
        else
            print_warning "$service_name PID file exists but process is not running"
            rm -f "$pid_file"
        fi
    else
        print_warning "$service_name PID file not found"
    fi
}

# Stop all services
stop_all_services() {
    print_status "Stopping all services..."
    
    # Stop BRC20 Programmable Module Server
    stop_service "BRC20 Programmable Module Server" "/root/brc20-indexer/brc20-programmable-module/brc20_prog.pid"
    
    # Stop Main Meta-Protocol Indexer (ord)
    stop_service "Main Meta-Protocol Indexer" "/root/brc20-indexer/OPI/ord/target/release/ord.pid"
    
    # Stop BRC20 Indexer
    stop_service "BRC20 Indexer" "/root/brc20-indexer/OPI/modules/brc20_index/brc20_index.pid"
    
    # Stop APIs
    cd /root/brc20-indexer/OPI/modules
    for api in brc20_api bitmap_api sns_api pow20_api; do
        stop_service "$(echo $api | tr '[:lower:]' '[:upper:]')" "$api/${api}.pid"
    done
    
    # Check for any remaining processes
    print_status "Checking for any remaining processes..."
    
    local remaining_processes=0
    
    # Check BRC20 programmable module
    if pgrep -f "server" > /dev/null; then
        print_warning "BRC20 Programmable Module Server process still running"
        remaining_processes=$((remaining_processes + 1))
    fi
    
    # Check ord
    if pgrep -f "ord.*index run" > /dev/null; then
        print_warning "Main Meta-Protocol Indexer process still running"
        remaining_processes=$((remaining_processes + 1))
    fi
    
    # Check BRC20 indexer
    if pgrep -f "brc20-index" > /dev/null; then
        print_warning "BRC20 Indexer process still running"
        remaining_processes=$((remaining_processes + 1))
    fi
    
    # Check APIs
    if pgrep -f "node.*api.js" > /dev/null; then
        print_warning "API processes still running"
        remaining_processes=$((remaining_processes + 1))
    fi
    
    if [ $remaining_processes -eq 0 ]; then
        print_success "All services stopped successfully!"
    else
        print_warning "$remaining_processes service(s) still running"
        print_status "You may need to manually stop them using: pkill -f <process_name>"
    fi
}

# Force kill all related processes
force_kill_all() {
    print_warning "Force killing all related processes..."
    
    # Kill BRC20 programmable module
    pkill -f "server" 2>/dev/null || true
    
    # Kill ord
    pkill -f "ord.*index run" 2>/dev/null || true
    
    # Kill BRC20 indexer
    pkill -f "brc20-index" 2>/dev/null || true
    
    # Kill APIs
    pkill -f "node.*api.js" 2>/dev/null || true
    
    # Remove PID files
    rm -f /root/brc20-indexer/brc20-programmable-module/brc20_prog.pid
    rm -f /root/brc20-indexer/OPI/ord/target/release/ord.pid
    rm -f /root/brc20-indexer/OPI/modules/brc20_index/brc20_index.pid
    rm -f /root/brc20-indexer/OPI/modules/*/brc20_api.pid
    rm -f /root/brc20-indexer/OPI/modules/*/bitmap_api.pid
    rm -f /root/brc20-indexer/OPI/modules/*/sns_api.pid
    rm -f /root/brc20-indexer/OPI/modules/*/pow20_api.pid
    
    print_success "All processes force killed and PID files removed"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -f, --force    Force kill all processes"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              Stop all services gracefully"
    echo "  $0 --force      Force kill all processes"
}

# Main execution
main() {
    local force_kill=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--force)
                force_kill=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "=========================================="
    echo "  OPI & BRC20 Programmable Module"
    echo "           Stop Script"
    echo "=========================================="
    echo ""
    
    if [ "$force_kill" = true ]; then
        force_kill_all
    else
        stop_all_services
    fi
    
    echo ""
    print_status "To start all services again, run: ./start_services.sh"
}

# Run main function
main "$@"
