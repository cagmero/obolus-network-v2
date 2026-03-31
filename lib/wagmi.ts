import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { bsc, bscTestnet, localhost } from 'wagmi/chains'
import { cookieStorage, createStorage } from 'wagmi'

// Wagmi config — BSC Testnet + Mainnet
export const config = getDefaultConfig({
  appName: 'Obolus Network',
  projectId: '1745eedb32cb0f103490b50b14761c85',
  chains: [bscTestnet, bsc, localhost],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
})

// Obolus V1 Contracts - BSC Testnet Core
export const OBOLUS_ADDRESSES = {
  bscTestnet: {
    RWAVault: "0x772C9513fFcffaed224048b3e22AcF9E58854b73" as const,
    ObolusOracle: "0xb0ab8015Ce10593eE9a26E78B0BeDBc21330ba23" as const,
    oUSD: "0x73b44a1C5e2c981594BA5dbb9d84edc905202f82" as const,
    ObolusAMM: "0x01E604F1D21Fc690A6fD9c2f7a27A5dA572cD8e4" as const,
    TSLAx: "0x2B05DC386bbe679fD22eDE500b52B858B86B3778" as const,
    AAPLx: "0x11ba0F051f6859a8BBb98cCa14B40F280FcB96F0" as const,
    NVDAon: "0x235a45B9d8A51c1D4aCFd2d4EaA9bA2B263E0c78" as const,
    GOOGLx: "0xa9308C9938C9E09AeD4211E777696feB1Ff0c77B" as const,
    SPYx: "0x39E2D41eB56188259137a8931a0Ce04fFEF6413f" as const,
    CRCLX: "0x6260371533F981A05d097f33283B1351a542F2Ff" as const,
    MUon: "0x7e8ED851A79e36fdAF3AF981dDd0C1aB05E72e3A" as const,
    QQQon: "0xDe03fE8EBeD5CFbc7B514EAbDbB79c449c986fd1" as const,
    AMZNon: "0x6E7f4106Fe51CB751a82BEfAD45d3b386301cCde" as const,
  },
  localhost: {
    RWAVault: "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c" as const,
    ObolusOracle: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed" as const,
  }
}

export const CONTRACT_ADDRESSES = OBOLUS_ADDRESSES.bscTestnet

// Typed Contract Configs
export const OBOLUS_CONTRACTS = {
  RWAVault: {
    address: CONTRACT_ADDRESSES.RWAVault,
    abi: [] as any, // Will be imported from lib/abis in hooks
  },
  ObolusOracle: {
    address: CONTRACT_ADDRESSES.ObolusOracle,
    abi: [] as any,
  }
} as const
