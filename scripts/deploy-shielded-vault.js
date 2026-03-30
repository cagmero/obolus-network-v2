/**
 * Deploy ShieldedVault to BSC Testnet.
 *
 * Usage:
 *   DEPLOYER_KEY=0x... POOL_WALLET=0x... node scripts/deploy-shielded-vault.js
 *
 * Or set in .env.local and run:
 *   node -r dotenv/config scripts/deploy-shielded-vault.js
 */

const solc = require('solc');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load env
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const BSC_TESTNET_RPC = process.env.NEXT_PUBLIC_BSC_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545';
const DEPLOYER_KEY = process.env.DEPLOYER_KEY || process.env.PRIVATE_KEY;
const POOL_WALLET = process.env.POOL_WALLET_ADDRESS || process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS;
const ORACLE_ADDRESS = '0xb0ab8015Ce10593eE9a26E78B0BeDBc21330ba23'; // existing ObolusOracle

if (!DEPLOYER_KEY) {
  console.error('❌ Set DEPLOYER_KEY or PRIVATE_KEY in .env.local');
  process.exit(1);
}

function findImports(importPath) {
  // Resolve @openzeppelin imports
  const ozBase = path.join(__dirname, '../node_modules');
  const candidates = [
    path.join(ozBase, importPath),
    path.join(ozBase, '@openzeppelin/contracts', importPath.replace('@openzeppelin/contracts/', '')),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { contents: fs.readFileSync(candidate, 'utf-8') };
    }
  }

  return { error: `File not found: ${importPath}` };
}

async function main() {
  console.log('🔨 Compiling ShieldedVault.sol...');

  const source = fs.readFileSync(path.join(__dirname, '../contracts/ShieldedVault.sol'), 'utf-8');

  const input = {
    language: 'Solidity',
    sources: {
      'ShieldedVault.sol': { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  // Check for errors
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('❌ Compilation errors:');
      errors.forEach(e => console.error(e.formattedMessage));
      process.exit(1);
    }
    // Print warnings
    output.errors.filter(e => e.severity === 'warning').forEach(e => {
      console.warn('⚠️', e.message);
    });
  }

  const contract = output.contracts['ShieldedVault.sol']['ShieldedVault'];
  const abi = contract.abi;
  const bytecode = '0x' + contract.evm.bytecode.object;

  console.log('✅ Compiled successfully');
  console.log(`   ABI: ${abi.length} functions`);
  console.log(`   Bytecode: ${bytecode.length} chars`);

  // Deploy
  console.log('\n🚀 Deploying to BSC Testnet...');
  const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC);
  const wallet = new ethers.Wallet(DEPLOYER_KEY, provider);

  console.log(`   Deployer: ${wallet.address}`);
  console.log(`   Pool Wallet: ${POOL_WALLET}`);
  console.log(`   Oracle: ${ORACLE_ADDRESS}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} tBNB`);

  if (balance < ethers.parseEther('0.01')) {
    console.error('❌ Insufficient tBNB. Get some from https://www.bnbchain.org/en/testnet-faucet');
    process.exit(1);
  }

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const shieldedVault = await factory.deploy(POOL_WALLET, ORACLE_ADDRESS);

  console.log(`   Tx: ${shieldedVault.deploymentTransaction().hash}`);
  console.log('   ⏳ Waiting for confirmation...');

  await shieldedVault.waitForDeployment();
  const address = await shieldedVault.getAddress();

  console.log(`\n✅ ShieldedVault deployed at: ${address}`);
  console.log(`   🔗 https://testnet.bscscan.com/address/${address}`);

  // Save ABI and address
  const deploymentData = {
    ShieldedVault: {
      address,
      abi,
      deployer: wallet.address,
      poolWallet: POOL_WALLET,
      oracle: ORACLE_ADDRESS,
      network: 'bscTestnet',
      chainId: 97,
      deployedAt: new Date().toISOString(),
      txHash: shieldedVault.deploymentTransaction().hash,
    },
  };

  fs.writeFileSync(
    path.join(__dirname, '../lib/shielded-vault-deployment.json'),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log('   📝 Saved deployment data to lib/shielded-vault-deployment.json');

  // Now add all 9 tokens
  console.log('\n📋 Adding accepted tokens...');
  const TOKEN_ADDRESSES = {
    TSLAx: '0x2B05DC386bbe679fD22eDE500b52B858B86B3778',
    AAPLx: '0x11ba0F051f6859a8BBb98cCa14B40F280FcB96F0',
    NVDAon: '0x235a45B9d8A51c1D4aCFd2d4EaA9bA2B263E0c78',
    GOOGLx: '0xa9308C9938C9E09AeD4211E777696feB1Ff0c77B',
    SPYx: '0x39E2D41eB56188259137a8931a0Ce04fFEF6413f',
    CRCLX: '0x6260371533F981A05d097f33283B1351a542F2Ff',
    MUon: '0x7e8ED851A79e36fdAF3AF981dDd0C1aB05E72e3A',
    QQQon: '0xDe03fE8EBeD5CFbc7B514EAbDbB79c449c986fd1',
    AMZNon: '0x6E7f4106Fe51CB751a82BEfAD45d3b386301cCde',
  };

  const vault = new ethers.Contract(address, abi, wallet);

  for (const [symbol, tokenAddr] of Object.entries(TOKEN_ADDRESSES)) {
    try {
      const tx = await vault.addToken(tokenAddr);
      await tx.wait();
      console.log(`   ✅ Added ${symbol}: ${tokenAddr}`);
    } catch (e) {
      console.error(`   ❌ Failed to add ${symbol}: ${e.message}`);
    }
  }

  console.log('\n🎉 Deployment complete!');
  console.log(`\nAdd to .env.local:`);
  console.log(`NEXT_PUBLIC_SHIELDED_VAULT=${address}`);
}

main().catch(e => {
  console.error('❌ Deploy failed:', e.message);
  process.exit(1);
});
