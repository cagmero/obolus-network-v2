import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { bsc, bscTestnet, localhost } from 'wagmi/chains'
import { parseAbi, defineChain } from 'viem'
import { cookieStorage, createStorage } from 'wagmi'

// Custom Zama Devnet Chain
export const zamaDevnet = defineChain({
  id: 7202,
  name: 'Zama Devnet',
  nativeCurrency: { name: 'ZAMA', symbol: 'ZAMA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://devnet.zama.ai'] },
  },
})

export const config = getDefaultConfig({
  appName: 'Obolus Network',
  projectId: '1745eedb32cb0f103490b50b14761c85',
  chains: [localhost, zamaDevnet, bsc, bscTestnet],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
})

// Obolus V1 Contracts - BSC Testnet Core (Replacing Zama placeholders)
export const OBOLUS_ADDRESSES = {
  bscTestnet: {
    RWAVault: "0x489675685B62bB958B5C9672777A464aBb31B299" as const,
    PositionManager: "0xe7Af7E8E7e9e8790EbB143e90bB3f05126d400E" as const,
    ObolusOracle: "0x91f8Aff3738825e8eB16FC6f6b1A7A4647bDB299" as const,
  },
  localhost: {
    RWAVault: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c" as const,
    PositionManager: "0x0000000000000000000000000000000000000000" as const, // Not deployed yet
    ObolusOracle: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed" as const,
  }
}

// ABIs - Updated for clean uint256 architecture
export const RWAVaultABI = parseAbi([
  "function deposit(address token, uint256 amount) external returns (uint256)",
  "function withdraw(address token, uint256 shares) external returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function balanceOf(address user) view returns (uint256)",
  "function acceptedTokens(address) view returns (bool)",
  "event Deposit(address indexed user, address indexed token, uint256 amount, uint256 shares)",
  "event Withdraw(address indexed user, address indexed token, uint256 amount, uint256 shares)"
])

export const PositionManagerABI = parseAbi([
  "function getPosition(address user, address token) view returns (uint256)",
  "function updatePosition(address user, address token, uint256 amount) external",
  "event PositionUpdated(address indexed user, address indexed token, uint256 amount)"
])

export const ObolusOracleABI = parseAbi([
  "function getGMTokenPrice(address token) view returns (uint256)",
  "function getPortfolioNAV(address[] tokens, uint256[] amounts) view returns (uint256)",
  "event OracleUpdated(address indexed oracle)"
])

// Typed Contract Configs
export const OBOLUS_CONTRACTS = {
  RWAVault: {
    address: OBOLUS_ADDRESSES.bscTestnet.RWAVault,
    abi: RWAVaultABI,
  },
  PositionManager: {
    address: OBOLUS_ADDRESSES.bscTestnet.PositionManager,
    abi: PositionManagerABI,
  },
  ObolusOracle: {
    address: OBOLUS_ADDRESSES.bscTestnet.ObolusOracle,
    abi: ObolusOracleABI,
  }
} as const
