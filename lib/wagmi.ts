import { http, createConfig, defineChain } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { parseAbi } from 'viem'

// Custom Zama Devnet Chain
export const zamaDevnet = defineChain({
  id: 7202,
  name: 'Zama Devnet',
  nativeCurrency: { name: 'ZAMA', symbol: 'ZAMA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://devnet.zama.ai'] },
  },
})

export const config = createConfig({
  chains: [zamaDevnet, bsc, bscTestnet],
  connectors: [
    injected(),
  ],
  ssr: true,
  transports: {
    [zamaDevnet.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
})

// Obolus V1 Contracts - Zama Devnet
export const OBOLUS_ADDRESSES = {
  zamaDevnet: {
    // These will be updated after deployment
    RWAVault: "0x489675685B62bB958B5C9672777A464aBb31B299" as const,
    PositionManager: "0xe7Af7E8E7e9e8790EbB143e90bB3f0512" as const,
    ObolusOracle: "0x91f8Aff3738825e8eB16FC6f6b1A7A4647bDB299" as const,
  }
}

// ABIs - Updated for fhEVM
export const RWAVaultABI = parseAbi([
  "function depositGM(address token, uint256 amount) external returns (uint256)",
  "function withdrawGM(address token, uint256 shares) external returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function balanceOf(address user) view returns (uint256)", // Returns euint64 address handle
  "function decryptBalance(address user) view returns (uint256)", // Decrypts if sender == user
  "function acceptedTokens(address) view returns (bool)",
  "event Deposited(address indexed user, address indexed token, uint256 amount, uint256 shares)",
  "event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 shares)"
])

export const PositionManagerABI = parseAbi([
  "function getPosition(address user, address token) view returns (uint256)", // Returns euint64 handle
  "function decryptPosition(address user, address token) view returns (uint256)",
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
    address: OBOLUS_ADDRESSES.zamaDevnet.RWAVault,
    abi: RWAVaultABI,
  },
  PositionManager: {
    address: OBOLUS_ADDRESSES.zamaDevnet.PositionManager,
    abi: PositionManagerABI,
  },
  ObolusOracle: {
    address: OBOLUS_ADDRESSES.zamaDevnet.ObolusOracle,
    abi: ObolusOracleABI,
  }
} as const
