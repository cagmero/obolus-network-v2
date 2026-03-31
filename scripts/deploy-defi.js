/**
 * Deploy DeFi contracts (gUSD, ObolusAMM, LendingPools) to BSC Testnet.
 *
 * Usage:
 *   DEPLOYER_KEY=0x... node scripts/deploy-defi.js
 *
 * Or from the hardhat project:
 *   cd ../obolus-smart-contracts-V2
 *   npx hardhat run scripts/deploy-defi.ts --network bscTestnet
 */

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const BSC_TESTNET_RPC = process.env.NEXT_PUBLIC_BSC_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545';
const DEPLOYER_KEY = process.env.DEPLOYER_KEY || process.env.PRIVATE_KEY;

if (!DEPLOYER_KEY) {
  console.error('❌ Set DEPLOYER_KEY or PRIVATE_KEY in .env.local');
  process.exit(1);
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('OBOLUS DeFi DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('This script deploys from the Hardhat project.');
  console.log('Run from obolus-smart-contracts-V2:');
  console.log('');
  console.log('  cd ../obolus-smart-contracts-V2');
  console.log('  npx hardhat run scripts/deploy-defi.ts --network bscTestnet');
  console.log('');
  console.log('After deployment, the addresses will be synced to');
  console.log('obolus-network-v2/lib/deployments.json automatically.');
  console.log('');
  console.log('Then update lib/defi-contracts.ts with the deployed addresses.');
  console.log('═══════════════════════════════════════════════════');
}

main();
