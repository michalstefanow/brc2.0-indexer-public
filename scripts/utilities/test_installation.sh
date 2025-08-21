#!/bin/bash

# OPI & BRC20 Programmable Module Installation Test Script
# This script tests if all components are properly installed

set -e

echo "🧪 Testing OPI & BRC20 Programmable Module Installation..."

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

# Test counter
tests_passed=0
tests_total=0

# Test function
test_component() {
    local test_name="$1"
    local test_command="$2"
    local expected_output="$3"
    
    tests_total=$((tests_total + 1))
    print_status "Testing: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name: PASSED"
        tests_passed=$((tests_passed + 1))
    else
        print_error "$test_name: FAILED"
    fi
}

# Test binary existence
test_binaries() {
    print_status "Testing binary files..."
    
    # Test ord binary
    test_component "ord binary" "test -f /root/brc20-indexer/OPI/ord/target/release/ord" "ord binary exists"
    
    # Test BRC20 indexer binary
    test_component "BRC20 indexer binary" "test -f /root/brc20-indexer/OPI/modules/brc20_index/target/release/brc20-index" "BRC20 indexer binary exists"
    
    # Test BRC20 programmable module server
    test_component "BRC20 programmable module server" "test -f /root/brc20-indexer/brc20-programmable-module/target/release/server" "BRC20 programmable module server exists"
}

# Test binary execution
test_binary_execution() {
    print_status "Testing binary execution..."
    
    # Test ord help
    test_component "ord help command" "cd /root/brc20-indexer/OPI/ord/target/release && ./ord --help > /dev/null" "ord help command works"
    
    # Test BRC20 indexer help
    test_component "BRC20 indexer help command" "cd /root/brc20-indexer/OPI/modules/brc20_index/target/release && ./brc20-index --help > /dev/null" "BRC20 indexer help command works"
}

# Test dependencies
test_dependencies() {
    print_status "Testing dependencies..."
    
    # Test Node.js
    test_component "Node.js" "node --version > /dev/null" "Node.js is available"
    
    # Test npm
    test_component "npm" "npm --version > /dev/null" "npm is available"
    
    # Test Rust
    test_component "Rust" "rustc --version > /dev/null" "Rust is available"
    
    # Test Cargo
    test_component "Cargo" "cargo --version > /dev/null" "Cargo is available"
    
    # Test Python
    test_component "Python" "python3 --version > /dev/null" "Python is available"
    
    # Test pip
    test_component "pip" "pip3 --version > /dev/null" "pip is available"
}

# Test Node.js modules
test_node_modules() {
    print_status "Testing Node.js modules..."
    
    cd /root/brc20-indexer/OPI/modules
    
    # Test BRC20 API
    test_component "BRC20 API node_modules" "test -d brc20_api/node_modules" "BRC20 API node_modules exist"
    
    # Test Bitmap API
    test_component "Bitmap API node_modules" "test -d bitmap_api/node_modules" "Bitmap API node_modules exist"
    
    # Test POW20 API
    test_component "POW20 API node_modules" "test -d pow20_api/node_modules" "POW20 API node_modules exist"
    
    # Test SNS API
    test_component "SNS API node_modules" "test -d sns_api/node_modules" "SNS API node_modules exist"
}

# Test Python environment
test_python_env() {
    print_status "Testing Python environment..."
    
    cd /root/brc20-indexer/OPI/modules
    
    # Test virtual environment
    test_component "Python virtual environment" "test -d .venv" "Python virtual environment exists"
    
    # Test requirements installation
    test_component "Python requirements" "source .venv/bin/activate && pip3 list | grep -q psycopg2-binary" "Python requirements installed"
}

# Test database
test_database() {
    print_status "Testing database..."
    
    # Test PostgreSQL service
    test_component "PostgreSQL service" "sudo systemctl is-active --quiet postgresql" "PostgreSQL service is running"
    
    # Test database connection
    test_component "Database connection" "sudo -u postgres psql -c 'SELECT version();' > /dev/null" "Database connection works"
}

# Test environment files
test_environment() {
    print_status "Testing environment configuration..."
    
    # Test BRC20 indexer .env
    test_component "BRC20 indexer .env" "test -f /root/brc20-indexer/OPI/modules/brc20_index/.env" "BRC20 indexer .env exists"
    
    # Test BRC20 programmable module .env
    test_component "BRC20 programmable module .env" "test -f /root/brc20-indexer/brc20-programmable-module/.env" "BRC20 programmable module .env exists"
}

# Test ports availability
test_ports() {
    print_status "Testing port availability..."
    
    # Test if ports are free (not in use)
    test_component "Port 18545 (BRC20 Prog RPC)" "! netstat -tlnp 2>/dev/null | grep -q :18545" "Port 18545 is available"
    
    test_component "Port 18546 (BRC20 Balance Server)" "! netstat -tlnp 2>/dev/null | grep -q :18546" "Port 18546 is available"
    
    test_component "Port 38332 (Bitcoin RPC)" "! netstat -tlnp 2>/dev/null | grep -q :38332" "Port 38332 is available"
}

# Show summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "           TEST SUMMARY"
    echo "=========================================="
    echo ""
    
    if [ $tests_passed -eq $tests_total ]; then
        print_success "ALL TESTS PASSED! ($tests_passed/$tests_total)"
        echo ""
        print_success "🎉 Installation is complete and ready to use!"
        echo ""
        print_status "Next steps:"
        echo "  1. Start Bitcoin Core with RPC enabled"
        echo "  2. Run: ./start_services.sh"
        echo "  3. Check logs for any errors"
    else
        print_error "SOME TESTS FAILED ($tests_passed/$tests_total)"
        echo ""
        print_warning "Please check the failed tests above and fix any issues"
        echo ""
        print_status "Common issues:"
        echo "  - Missing dependencies"
        echo "  - Incorrect file paths"
        echo "  - Permission issues"
        echo "  - Service not running"
    fi
    
    echo ""
    print_status "For detailed information, see STARTUP_GUIDE.md"
}

# Main execution
main() {
    echo "=========================================="
    echo "  OPI & BRC20 Programmable Module"
    echo "         Installation Test"
    echo "=========================================="
    echo ""
    
    # Run all tests
    test_binaries
    test_binary_execution
    test_dependencies
    test_node_modules
    test_python_env
    test_database
    test_environment
    test_ports
    
    # Show summary
    show_summary
}

# Run main function
main "$@"
