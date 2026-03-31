# Obolus Network V2 (Protocol Dashboard) 🌌

The core application of the **Obolus Network** ecosystem. This frontend allows users to privately manage a portfolio of tokenized equities on **BNB Chain** using a three-layer privacy architecture powered by **Chainlink CRE**.

## 🏗️ Three-Layer Trust Architecture

Obolus V2 separates concerns across three independent trust domains to ensure institutional-grade privacy:

| Layer | Role | Trust Property |
|-------|------|----------------|
| **Custody** | `RWAVault` on BSC Testnet + Pool Wallet | Funds move only via user action or valid CRE-signed transfer |
| **Blind Storage** | **Obolus API** (Next.js + MongoDB) | Stores encrypted positions; cannot decrypt amounts or move funds |
| **Settlement Engine** | **Chainlink CRE** (TEE) | Decrypts positions, settles NAV, executes transfers; plaintext wiped after each cycle |

### 1. **Pool Wallet Pattern**
After depositing on-chain, users "shield" their tokens by transferring them to a shared **Pool Wallet**. All subsequent fund movements happen from this shared address, making individual positions untraceable on-chain.

### 2. **ECIES Encryption + CRE**
Position amounts are encrypted client-side using **ECIES (secp256k1)** using the CRE's public key. The server stores these encrypted blobs but lacks the private key to read them. Only the **Chainlink CRE** (running inside a TEE) can decrypt these positions for settlement.

### 3. **EIP-712 Authentication**
All user-facing server actions require a signed **EIP-712 typed data message**, proving wallet ownership without ever exposing private keys to the backend.

---

## 📡 Live Smart Contracts (BSC Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **RWAVault** | `0x772C9513fFcffaed224048b3e22AcF9E58854b73` | [BscScan](https://testnet.bscscan.com/address/0x772C9513fFcffaed224048b3e22AcF9E58854b73) |
| **ObolusOracle** | `0xb0ab8015Ce10593eE9a26E78B0BeDBc21330ba23` | [BscScan](https://testnet.bscscan.com/address/0xb0ab8015Ce10593eE9a26E78B0BeDBc21330ba23) |
| **oUSD (Stable)** | `0x73b44a1C5e2c981594BA5dbb9d84edc905202f82` | [BscScan](https://testnet.bscscan.com/address/0x73b44a1C5e2c981594BA5dbb9d84edc905202f82) |
| **ObolusAMM** | `0x01E604F1D21Fc690A6fD9c2f7a27A5dA572cD8e4` | [BscScan](https://testnet.bscscan.com/address/0x01E604F1D21Fc690A6fD9c2f7a27A5dA572cD8e4) |
| **TSLAx Pool** | `0x0e38d8069C194d6b12C6B6002f9286C91a0BcE91` | [BscScan](https://testnet.bscscan.com/address/0x0e38d8069C194d6b12C6B6002f9286C91a0BcE91) |
| **AAPLx Pool** | `0x35d702B460150c09ae181A2129eab70428Dc8889` | [BscScan](https://testnet.bscscan.com/address/0x35d702B460150c09ae181A2129eab70428Dc8889) |
| **NVDAon Pool** | `0x3cfc330FB24A318fc619Ee8aE80DD3c9f92Dc65e` | [BscScan](https://testnet.bscscan.com/address/0x3cfc330FB24A318fc619Ee8aE80DD3c9f92Dc65e) |
| **GOOGLx Pool** | `0xeD299858B4F95c30F3fceE9209fBbeA7138cE854` | [BscScan](https://testnet.bscscan.com/address/0xeD299858B4F95c30F3fceE9209fBbeA7138cE854) |
| **SPYx Pool** | `0x383FF0528b2c1Db2C5D439E5E64157851189ADC4` | [BscScan](https://testnet.bscscan.com/address/0x383FF0528b2c1Db2C5D439E5E64157851189ADC4) |

---

## 🔒 Privacy Model (The "Dumb Store")

Obolus implements a "Dumb Store" architecture where the server is intentionally blind to user balances:

| Data | Server | TEE (CRE) | On-Chain |
|------|--------|-----------|----------|
| **Position amounts** | Encrypted blobs | Decrypted in-memory | Hidden in Pool Wallet |
| **Token types** | Visible | Visible | Public (Vault/Pool) |
| **User identities** | Visible (Address) | Verified | Visible (Deposits) |
| **NAV values** | Computed client-side | Verified for settlement | Hidden |

---

## 📁 Project Structure

```
obolus-network-v2/
  app/                    Next.js App Router
    api/v1/               Privacy layer API (Next.js serverless)
      vault/shield/       Shielding logic (Token -> Pool Wallet)
      vault/reveal/       Client-side decryption handler
  hooks/                  Privacy-aware React hooks
    usePrivacyReveal.ts   Local AES key derivation from EIP-712
    useShieldedVault.ts   Interaction with RWAVault and Pool
  lib/                    Core cryptographic utilities
    encryption.ts         ECIES implementation for secp256k1
    eip712.ts             Typed data domains and messages
  components/             "Neon Confidential" UI components
```

## 🛠️ Development Setup

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file:
```bash
NEXT_PUBLIC_DEPLOYER_ADDRESS=0x...
NEXT_PUBLIC_DEFAULT_CHAIN_ID=97
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_POOL_WALLET_ADDRESS=0x...
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🏆 RWA Demo Day
Built for the **BNB Chain RWA Demo Day (March 2026)** — showcasing institutional privacy for RWA liquidity via Chainlink CRE.

---
<div align="center">
  <p>© 2026 OBOLUS NETWORK | Built on BNB Chain | Powered by Chainlink CRE</p>
</div>
