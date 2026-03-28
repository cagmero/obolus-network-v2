# Obolus V1 — Privacy Equity Vault

## What It Is
Privacy-preserving tokenized equity vault on BNB Chain. 
Deposit Ondo Global Markets (GM) tokens (TSLAon, NVDAon, SPYon, QQQon) — tokenized versions of real-world US equities.
Positions are encrypted via **Zama fhEVM**, ensuring that holdings and balances are completely private on-chain.

## Features
- **Shielded Positions**: All user holdings are stored as encrypted ciphertexts.
- **On-chain Privacy**: Contract logic operates on encrypted data without ever seeing the plaintext.
- **RWA Exposure**: Direct access to US equities (Tesla, Nvidia, S&P 500) via Ondo GM tokens.
- **Confidential Analytics**: View your portfolio and share prices privately using browser-side decryption.

## Live Demo
[app.obolus.network](https://app.obolus.network)

## Tech Stack
- **Network**: BNB Chain (Mainnet + Testnet)
- **Encryption**: Zama fhEVM (Fully Homomorphic Encryption)
- **Assets**: Ondo Global Markets GM Tokens
- **Frontend**: Next.js 15, wagmi, viem, RainbowKit
- **Standards**: ERC-4626 (Tokenized Vault Standard)

## Contracts (BSC Testnet)
- **RWAVault**: `0x489675685B62bB958B5C9672777A464aBb31B299`
- **PositionManager**: `0xe7Af7E8E7e9e8790EbB143e90bB3f0512`
- **ObolusOracle**: `0x91f8Aff3738825e8eB16FC6f6b1A7A4647bDB299`

## Running Locally

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run dev server:
```bash
npm run dev
```

## Hackathon
Developed for **RWA Demo Day — BNB Chain — March 2026**
