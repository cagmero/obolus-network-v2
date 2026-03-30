# Obolus Privacy Layer — Setup & Demo Guide

## Quick Start (Demo Mode)

The privacy layer auto-generates CRE keys on first run. Just:

```bash
cd obolus-network-v2
npm run dev
```

On first request to `/api/v1/cre-public-key`, a keypair is generated and saved to `.cre-keys.json`.

## Environment Variables (Optional)

Add to `.env.local` for explicit configuration:

```bash
# CRE keypair (auto-generated if not set)
CRE_PUBLIC_KEY=04...hex...
CRE_PRIVATE_KEY=...hex...

# Pool wallet (for on-chain transfers)
POOL_WALLET_ADDRESS=0x...
POOL_PRIVATE_KEY=0x...

# Internal API key for CRE endpoints
INTERNAL_API_KEY=obolus-cre-secret-2026
```

### Generate Keys Manually

```bash
# CRE keypair
node -e "const{PrivateKey}=require('eciesjs');const k=new PrivateKey();console.log('CRE_PUBLIC_KEY='+k.publicKey.toHex());console.log('CRE_PRIVATE_KEY='+Buffer.from(k.secret).toString('hex'))"

# Pool wallet
node -e "const{ethers}=require('ethers');const w=ethers.Wallet.createRandom();console.log('POOL_WALLET_ADDRESS='+w.address);console.log('POOL_PRIVATE_KEY='+w.privateKey)"
```

## Demo Flow

### 1. Shielded Deposit
- Go to any vault page (e.g. `/vault/tslax`)
- Enter an amount and click DEPOSIT_ASSETS
- Watch the 3-step flow:
  1. Approve + Deposit (on-chain)
  2. EIP-712 Signature (wallet popup)
  3. ECIES Encrypt + Shield (to pool wallet)

### 2. Privacy Reveal
- Go to `/portfolio`
- Click the privacy toggle (eye icon)
- Sign the EIP-712 "Privacy Reveal" message
- Your positions are decrypted client-side

### 3. CRE Settlement Simulation
- Call the CRE simulator endpoint:
```bash
curl -X POST http://localhost:3000/api/v1/cre/simulate-cycle | jq
```
- This runs one settlement cycle: processes pending transfers, decrypts positions, computes NAV

### 4. Internal CRE Endpoints
```bash
# Pending transfers (CRE-only)
curl -H "x-api-key: dev-key" http://localhost:3000/api/v1/internal/pending-transfers

# Pool health
curl -H "x-api-key: dev-key" http://localhost:3000/api/v1/internal/pool-health

# All shielded positions (encrypted)
curl -H "x-api-key: dev-key" http://localhost:3000/api/v1/internal/shielded-positions
```

## Architecture

```
User Wallet
    │
    ├─ 1. approve + deposit ──────────► RWAVault (on-chain, BSC Testnet)
    │
    ├─ 2. sign EIP-712 ──────────────► Wallet popup
    │
    ├─ 3. encrypt(amount, CRE_PUBKEY) ► Client-side ECIES
    │
    └─ 4. POST /vault/shield ────────► Obolus Server (blind storage)
         │                               │
         │  encryptedAmount stored        │ Cannot decrypt
         │                               │
         └─ 5. queueTransfer ───────────► Pending Transfers
                                          │
                                          ▼
                                    CRE Settlement Cycle
                                    (every 15-30 seconds)
                                          │
                                    ┌─────┴─────┐
                                    │  TEE Only  │
                                    │            │
                                    │ decrypt()  │
                                    │ settle()   │
                                    │ sign()     │
                                    │ execute()  │
                                    │            │
                                    │ wipe mem   │
                                    └────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `lib/eip712.ts` | EIP-712 typed data definitions |
| `lib/encryption.ts` | ECIES encryption + AES key derivation |
| `lib/server/state.ts` | File-backed blind storage |
| `lib/server/auth.ts` | EIP-712 signature verification |
| `lib/server/cre-keys.ts` | CRE keypair management |
| `hooks/useShieldedVault.ts` | Shielded deposit/withdraw hooks |
| `hooks/usePrivacyReveal.ts` | Privacy reveal hook |
| `app/api/v1/vault/shield/` | Shielded deposit endpoint |
| `app/api/v1/vault/unshield/` | Shielded withdraw endpoint |
| `app/api/v1/vault/reveal/` | Privacy reveal endpoint |
| `app/api/v1/cre/simulate-cycle/` | Local CRE simulator |
| `app/api/v1/internal/` | CRE-only endpoints |
| `obolus-settler/` | Chainlink CRE workflow templates |
