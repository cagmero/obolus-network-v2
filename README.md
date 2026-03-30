# Obolus Network V2 (Protocol) 🌌

The core application of the **Obolus Network** ecosystem. This frontend allows users to privately manage a portfolio of tokenized equities on **BNB Chain**.

## 🏗️ Technical Architecture

Obolus V2 uses a robust, on-chain first architecture for managing privacy-preserving assets:

### 1. **Centralized Hook System**
We use a specialized hook layer in `hooks/` to manage all blockchain and server state:
- `useContracts.ts`: Real-time on-chain data retrieval from **BSC Testnet** for balances and oracle values.
- `useContractWrite.ts`: Multi-step transaction flows (`useDepositFlow`, `useWithdrawFlow`) that handle on-chain execution and server-side state persistence.
- `useMarketData.ts`: Combines live stock data (via **Twelve Data**) with on-chain settlement multipliers from **Ondo Finance**.

### 2. **Wagmi & RainbowKit Integration**
Native Web3 connectivity on **BSC Testnet** with a customized **Neon Confidential** theme.

### 3. **Privacy Reveal Mechanism**
Leveraging **ECIES encryption + Chainlink CRE**, user balances are stored as encrypted ciphertexts. The server acts as "dumb storage" and cannot read positions. The UI features a "Privacy Reveal" toggle that locally decrypts these values for the user.

---

## 📡 Live Protocol Addresses (BSC Testnet)

The protocol is currently deployed and verified at the following addresses:

- **RWAVault**: `0xe5323C5df26330ce14E9a7BeCd19a272C730A58f`
- **ObolusOracle**: `0x323e71E1C931B2A10996D98E561A7A4647bDB299` (Note: Updated address)
- **GM Tokens (9 Assets)**: Including **TSLAx**, **NVDAon**, **AMZNon**, and more.

---

## 🛠️ Development Setup

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env.local` with the following:
```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_BSC_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
```

### Running Locally
```bash
npm run dev
```

---

## 📁 Project Structure

- `app/`: Next.js App Router (Faucet, Vaults, Portfolio, Markets).
- `hooks/`: Specialized Web3 and API interaction hooks.
- `lib/`: Centralized ABIs, API client, and Wagmi configuration.
- `components/`: UI components using the "Neon Confidential" design system.

## 🏆 RWA Demo Day
This project was developed for the **BNB Chain RWA Demo Day (March 2026)** to showcase the fusion of institutional privacy and RWA liquidity.

---
<div align="center">
  <p>© 2026 OBOLUS NETWORK | Built on BNB Chain</p>
</div>
