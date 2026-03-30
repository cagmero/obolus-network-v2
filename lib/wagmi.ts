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
  chains: [localhost, bsc, bscTestnet],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
})

// Obolus V1 Contracts - BSC Testnet Core (Replacing Zama placeholders)
export const OBOLUS_ADDRESSES = {
  bscTestnet: {
    RWAVault: "0x772C9513fFcffaed224048b3e22AcF9E58854b73" as const,
    ObolusOracle: "0xb0ab8015Ce10593eE9a26E78B0BeDBc21330ba23" as const,
  },
  localhost: {
    RWAVault: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c" as const,
    PositionManager: "0x0000000000000000000000000000000000000000" as const, // Not deployed yet
    ObolusOracle: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed" as const,
  }
}

// ABIs - Updated for clean uint256 architecture
export const RWAVaultABI = parseAbi([
  "function deposit(address token, uint256 amount) external",
  "function withdraw(address token, uint256 shares) external",
  "function acceptedTokens(address token) view returns (bool)",
  "function getPosition(address user, address token) view returns (uint256)",
  "function getTotalShares(address user) view returns (uint256)",
  "event Deposited(address indexed token, uint256 amount, address indexed receiver)",
  "event Withdrawn(address indexed token, uint256 amount, address indexed receiver)"
])

export const ObolusOracleABI = parseAbi([
  "function getSValue(address token) view returns (uint128 sValue, bool paused)",
  "function getAllSValues() view returns (address[] tokens, uint128[] sValues, bool[] paused)",
  "function registeredTokens(address token) view returns (bool)",
  "event TokenRegistered(address indexed token)"
])

// Typed Contract Configs
export const OBOLUS_CONTRACTS = {
  RWAVault: {
    address: OBOLUS_ADDRESSES.bscTestnet.RWAVault,
    abi: RWAVaultABI,
  },
  ObolusOracle: {
    address: OBOLUS_ADDRESSES.bscTestnet.ObolusOracle,
    abi: ObolusOracleABI,
  }
} as const
