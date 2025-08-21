#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧭 BRC20 Indexer Navigation Guide\n');

const directories = {
    '📚 docs': 'Documentation and guides',
    '🚀 scripts/deployment': 'Smart contract deployment scripts',
    '🧪 scripts/testing': 'Testing and validation scripts',
    '🏦 scripts/defi': 'DeFi application examples',
    '🛠️  scripts/utilities': 'System utilities and monitoring',
    '🎯 examples': 'HTML examples and demos'
};

console.log('📁 Directory Structure:');
Object.entries(directories).forEach(([dir, description]) => {
    console.log(`   ${dir} - ${description}`);
});

console.log('\n🎯 Quick Commands:');
console.log('   Start Services: cd scripts/utilities && ./start_services.sh');
console.log('   Test System: cd scripts/testing && node test_full_integration.js');
console.log('   Deploy Contract: cd scripts/deployment && node deploy_smart_contract.js');
console.log('   Build DeFi: cd scripts/defi && node defi_lending_app.js');

console.log('\n📋 Available Scripts:');

// List deployment scripts
console.log('\n🚀 Deployment Scripts:');
const deploymentFiles = fs.readdirSync('scripts/deployment');
deploymentFiles.forEach(file => {
    console.log(`   - ${file}`);
});

// List testing scripts
console.log('\n🧪 Testing Scripts:');
const testingFiles = fs.readdirSync('scripts/testing');
testingFiles.forEach(file => {
    console.log(`   - ${file}`);
});

// List DeFi scripts
console.log('\n🏦 DeFi Scripts:');
const defiFiles = fs.readdirSync('scripts/defi');
defiFiles.forEach(file => {
    console.log(`   - ${file}`);
});

// List utility scripts
console.log('\n🛠️  Utility Scripts:');
const utilityFiles = fs.readdirSync('scripts/utilities');
utilityFiles.forEach(file => {
    console.log(`   - ${file}`);
});

console.log('\n🎉 Your workspace is now clean and organized!');
console.log('📖 See README.md for detailed information.');
