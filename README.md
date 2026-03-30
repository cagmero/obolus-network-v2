# Obolus Network V2 (Protocol) 🌌

The core application of the **Obolus Network** ecosystem. This frontend allows users to privately manage a portfolio of tokenized equities on **BNB Chain** using a three-layer privacy architecture powered by **Chainlink CRE**.

## 🏗️ Three-Layer Trust Architecture

Obolus V2 separates concerns across three independent trust domains (inspired by Ghost Finance):

| Layer | Role | Trust Property |
|-------|------|----------------|
| **Custody** | RWAVault on BSC Testnet + Pool Wallet | Funds move only via user action or valid CRE-signed transfer |
| **Blind Storage** | Obolus API (Next.js + in-memory state) | Stores encrypted positions; cannot decrypt amounts or move funds |
| **Settlement Engine** | Chainlink CRE (TEE) | Decrypts positions, settles NAV, executes transfers; plaintext wiped after each cycle |

### 1. **Pool Wallet Pattern**
After depositing on-chain, users "shield" their tokens by transferring to a shared pool wallet. All subsequent fund movements happen from the pool address, making individual positions untraceable on-chain.

### 2. **ECIES Encryption + CRE**
Position amounts are encrypted client-side using ECIES (secp256k1) with the CRE public key. The server stores encrypted blobs but cannot read them. Only the CRE (running inside a TEE) can decrypt positions for NAV settlement.

### 3. **EIP-712 Authentication**
All user-facing server actions require a signed EIP-712 typed data message, proving wallet ownership without exposing private keys.

### 4. **Privacy Reveal Mechanism**
Users can locally decrypt their own positions by signing a "Privacy Reveal" request. The signature derives an AES key that decrypts user-specific data client-side.

### 5. **Wagmi & RainbowKit Integration**
Native Web3 connectivity on **BSC Testnet** with a customized **Neon Confidential** theme.

---

## 🔒 Privacy Model

| Data | Server | CRE (TEE) | On-Chain |
|------|--------|-----------|----------|
| Position amounts | Ciphertext only | Plaintext during settlement (ephemeral) | Never visible (pool wallet) |
| Token types | Visible | Visible | Vault-level only |
| User addresses | Visible | Visible | Deposit tx only |
| NAV values | Encrypted per-user | Computed each cycle | Not visible |
| Oracle prices | Visible | Visible | On-chain (ObolusOracle) |

---

## 📡 Live Protocol Addresses (BSC Testnet)

- **RWAVault**: `0x772C9513fFcffaed224048b3e22AcF9E58854b73`
- **ObolusOracle**: `0xb0ab8015Ce10593eE9a26E78B0BeDBc21330ba23`
- **GM Tokens (9 Assets)**: TSLAx, AAPLx, NVDAon, GOOGLx, SPYx, CRCLX, MUon, QQQon, AMZNon

---

## 🛠️ Development Setup

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env.local`:
```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_BSC_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
CRE_PUBLIC_KEY=04...hex...
POOL_WALLET_ADDRESS=0x...
INTERNAL_API_KEY=your-secret-key
```

### Running Locally
```bash
npm run dev
```

### CRE Workflows
```bash
cd obolus-settler
# Install dependencies for each workflow
cd settle-positions && npm install && cd ..
cd execute-transfers && npm install && cd ..
cd health-monitor && npm install && cd ..

# Simulate a workflow
cre workflow simulate ./settle-positions --target=staging-settings --non-interactive --trigger-index=0
```

---

## 📁 Project Structure

```
obolus-network-v2/
  app/                    Next.js App Router (Faucet, Vaults, Portfolio, Markets)
    api/v1/               Privacy layer API routes
      vault/shield/       Shielded deposit endpoint
      vault/unshield/     Shielded withdrawal endpoint
      vault/reveal/       Privacy reveal endpoint
      internal/           CRE-only endpoints (x-api-key auth)
  hooks/                  Specialized Web3 and privacy hooks
    useShieldedVault.ts   Ghost-style deposit/withdraw with pool wallet
    usePrivacyReveal.ts   EIP-712 signed position reveal
  lib/                    Core libraries
    encryption.ts         ECIES encryption for CRE
    eip712.ts             EIP-712 typed data definitions
    privacy-types.ts      Privacy layer type definitions
    server/               Server-side state and auth
  components/             UI components (Neon Confidential design)
  obolus-settler/         Chainlink CRE workflows
    settle-positions/     NAV settlement (30s cycle)
    execute-transfers/    Transfer execution (15s cycle)
    health-monitor/       Pool health monitoring (60s cycle)
```

## 🏆 RWA Demo Day
Built for the **BNB Chain RWA Demo Day (March 2026)** — showcasing institutional privacy for RWA liquidity via Chainlink CRE.

---
<div align="center">
  <p>© 2026 OBOLUS NETWORK | Built on BNB Chain | Powered by Chainlink CRE</p>
</div>
