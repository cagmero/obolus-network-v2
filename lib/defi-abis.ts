import { Abi } from 'viem';

export const oUSDABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "mint", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "burn", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "name", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "transferFrom", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
] as const as Abi;

export const ObolusAMMABI = [
  { inputs: [{ name: "_stableToken", type: "address" }], stateMutability: "nonpayable", type: "constructor" },
  { anonymous: false, inputs: [{ indexed: true, name: "poolId", type: "bytes32" }, { indexed: true, name: "stockToken", type: "address" }], name: "PoolCreated", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "poolId", type: "bytes32" }, { indexed: true, name: "provider", type: "address" }, { indexed: false, name: "stockAmount", type: "uint256" }, { indexed: false, name: "stableAmount", type: "uint256" }, { indexed: false, name: "lpMinted", type: "uint256" }], name: "LiquidityAdded", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "poolId", type: "bytes32" }, { indexed: true, name: "provider", type: "address" }, { indexed: false, name: "stockAmount", type: "uint256" }, { indexed: false, name: "stableAmount", type: "uint256" }, { indexed: false, name: "lpBurned", type: "uint256" }], name: "LiquidityRemoved", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "poolId", type: "bytes32" }, { indexed: true, name: "user", type: "address" }, { indexed: false, name: "tokenIn", type: "address" }, { indexed: false, name: "amountIn", type: "uint256" }, { indexed: false, name: "amountOut", type: "uint256" }], name: "Swap", type: "event" },
  { inputs: [], name: "stableToken", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "FEE_BPS", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "stockToken", type: "address" }], name: "getPoolId", outputs: [{ name: "", type: "bytes32" }], stateMutability: "pure", type: "function" },
  { inputs: [{ name: "stockToken", type: "address" }], name: "createPool", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "stockToken", type: "address" }, { name: "stockAmount", type: "uint256" }, { name: "stableAmount", type: "uint256" }], name: "addLiquidity", outputs: [{ name: "lpMinted", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "stockToken", type: "address" }, { name: "lpAmount", type: "uint256" }], name: "removeLiquidity", outputs: [{ name: "stockOut", type: "uint256" }, { name: "stableOut", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "stockToken", type: "address" }, { name: "amountIn", type: "uint256" }], name: "swapStockForStable", outputs: [{ name: "amountOut", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "stockToken", type: "address" }, { name: "amountIn", type: "uint256" }], name: "swapStableForStock", outputs: [{ name: "amountOut", type: "uint256" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "stockToken", type: "address" }, { name: "amountIn", type: "uint256" }, { name: "stockToStable", type: "bool" }], name: "getAmountOut", outputs: [{ name: "amountOut", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "stockToken", type: "address" }], name: "getPoolInfo", outputs: [{ name: "reserveStock", type: "uint256" }, { name: "reserveStable", type: "uint256" }, { name: "totalLP", type: "uint256" }, { name: "active", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getPoolCount", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const as Abi;

export const ObolusLendingPoolABI = [
  { inputs: [{ name: "_stockToken", type: "address" }, { name: "_stableToken", type: "address" }, { name: "_oracle", type: "address" }], stateMutability: "nonpayable", type: "constructor" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "Lend", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "amount", type: "uint256" }], name: "WithdrawLend", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "collateral", type: "uint256" }, { indexed: false, name: "borrowed", type: "uint256" }], name: "Borrow", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { indexed: false, name: "repaid", type: "uint256" }, { indexed: false, name: "collateralReturned", type: "uint256" }], name: "Repay", type: "event" },
  { inputs: [], name: "stockToken", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "stableToken", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "lend", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "withdrawLend", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "collateralAmount", type: "uint256" }, { name: "borrowAmount", type: "uint256" }], name: "borrow", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "repayAmount", type: "uint256" }], name: "repay", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "getPoolStats", outputs: [{ name: "_totalLent", type: "uint256" }, { name: "_totalBorrowed", type: "uint256" }, { name: "_available", type: "uint256" }, { name: "_utilizationBps", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getBorrowPosition", outputs: [{ name: "collateral", type: "uint256" }, { name: "borrowed", type: "uint256" }, { name: "lastBlock", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "lenderBalances", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalLent", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalBorrowed", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const as Abi;
