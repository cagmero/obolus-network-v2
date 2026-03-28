import { http, createConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { parseAbi } from 'viem'

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
  ],
  ssr: true,
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
})

// Obolus V1 Contracts - BSC Testnet
export const OBOLUS_ADDRESSES = {
  bscTestnet: {
    RWAVault: "0x489675685B62bB958B5C9672777A464aBb31B299" as const,
    PositionManager: "0xe7Af7E8E7e9e8790EbB143e90bB3f0512" as const,
    ObolusOracle: "0x91f8Aff3738825e8eB16FC6f6b1A7A4647bDB299" as const,
  }
}

// ABIs
export const RWAVaultABI = parseAbi([
  "function depositGM(address token, uint256 amount) external returns (uint256)",
  "function withdrawGM(address token, uint256 shares) external returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function balanceOf(address user) view returns (uint256)",
  "function acceptedTokens(address) view returns (bool)",
  "event Deposited(address indexed user, address indexed token, uint256 amount, uint256 shares)",
  "event Withdrawn(address indexed user, address indexed token, uint256 amount, uint256 shares)"
])

export const PositionManagerABI = parseAbi([
  "function getPosition(address user, address token) view returns (uint256)",
  "function updatePosition(address user, address token, uint256 amount) external",
  "function getTotalPositions(address user) view returns (uint256)",
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
