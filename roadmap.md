# Obolus Roadmap

## V1 — Privacy Equity Vault (Live — March 2026)
- ERC-4626 RWAVault.sol accepting TSLAon, NVDAon, SPYon, QQQon on BNB Chain
- ECIES-encrypted balances via Chainlink CRE — nobody sees your positions
- PositionManager.sol — encrypted per-user per-token holdings
- ObolusOracle.sol — wraps Ondo SyntheticSharesOracle for real-time NAV
- wGM vault shares — encrypted ERC-4626 receipt tokens
- Deposit / withdraw as GM tokens or USDon
- BSC Mainnet + BSC Testnet
- Frontend: Vault, Portfolio, Markets, Privacy, Transactions

## V1.5 — Private Transfers (Q2 2026)
- Encrypted transfer amounts — not just balances
- Shield deposit amounts from on-chain observers
- CRE-based private approval flows

## V2 — Yield Router (Q3 2026)
- Post GM tokens as collateral to BSC lending markets (Venus, Lista)
- Borrow USDC against GM collateral
- Route USDC to highest-yield DeFi source
- Encrypted allocation weights — strategy is a trade secret
- Net APY = stock appreciation + DeFi yield − borrow cost
- YieldRouter.sol with encrypted allocation weights

## V2.5 — Credit Layer (Q4 2026)
- Yield accrual services undercollateralized loans
- User posts GM tokens → borrows against yield → yield pays interest automatically
- No merchants, no BNPL UI — pure protocol-level credit

## V3 — Multi-chain (2027)
- Expand to Ethereum mainnet (Ondo GM tokens live there too)
- Arbitrum deployment
- Cross-chain vault positions via LayerZero

## Key Contracts (BSC Mainnet)
- GMTokenManager: 0x91f8Aff3738825e8eB16FC6f6b1A7A4647bDB299
- USDon: 0x1f8955E640Cbd9abc3C3Bb408c9E2E1f5F20DfE6
- SyntheticSharesOracle: 0xF4Fd8a1B412633e10527454137A29Db7Aa35F15e
- GMTokenLimitOrder: 0x96b525B1a93f31E65F4aAf18C53842eD28525D48
