import { TOKEN_ADDRESSES } from './tokenAddresses';

// DeFi contract addresses — deployed on BSC Testnet
export const DEFI_ADDRESSES = {
  oUSD: '0xfCaBa68297d86E56e01E8e9CcB88AF06bc093b9E' as `0x${string}`,
  ObolusAMM: '0x41a6493078fCF8D554DF94769F9B3b201756cb58' as `0x${string}`,
  LendingPools: {} as Record<string, `0x${string}`>,  // Deploy with more tBNB
} as const;

// Token list for the swap UI
export interface SwapToken {
  symbol: string;
  name: string;
  address: `0x${string}`;
  logo: string;
  isStable: boolean;
  decimals: number;
}

export const SWAP_TOKENS: SwapToken[] = [
  {
    symbol: 'oUSD',
    name: 'Obolus Stablecoin',
    address: DEFI_ADDRESSES.oUSD as `0x${string}`,
    logo: '/placeholder-logo.svg',
    isStable: true,
    decimals: 18,
  },
  {
    symbol: 'TSLAx',
    name: 'Tesla Tokenized',
    address: TOKEN_ADDRESSES.TSLAx as `0x${string}`,
    logo: '/stocks/TSLA.png',
    isStable: false,
    decimals: 18,
  },
  {
    symbol: 'AAPLx',
    name: 'Apple Tokenized',
    address: TOKEN_ADDRESSES.AAPLx as `0x${string}`,
    logo: '/stocks/AAPL.png',
    isStable: false,
    decimals: 18,
  },
  {
    symbol: 'NVDAon',
    name: 'Nvidia Tokenized',
    address: TOKEN_ADDRESSES.NVDAon as `0x${string}`,
    logo: '/stocks/NVDA.png',
    isStable: false,
    decimals: 18,
  },
  {
    symbol: 'GOOGLx',
    name: 'Google Tokenized',
    address: TOKEN_ADDRESSES.GOOGLx as `0x${string}`,
    logo: '/stocks/GOOGL.png',
    isStable: false,
    decimals: 18,
  },
  {
    symbol: 'SPYx',
    name: 'S&P500 ETF Tokenized',
    address: TOKEN_ADDRESSES.SPYx as `0x${string}`,
    logo: '/stocks/SPY.png',
    isStable: false,
    decimals: 18,
  },
  {
    symbol: 'CRCLX',
    name: 'Circle Tokenized',
    address: TOKEN_ADDRESSES.CRCLX as `0x${string}`,
    logo: '/stocks/CRCL.png',
    isStable: false,
    decimals: 18,
  },
  {
    symbol: 'MUon',
    name: 'Micron Tokenized',
    address: TOKEN_ADDRESSES.MUon as `0x${string}`,
    logo: '/stocks/MU.png',
    isStable: false,
    decimals: 18,
  },
  {
    symbol: 'QQQon',
    name: 'Nasdaq100 Tokenized',
    address: TOKEN_ADDRESSES.QQQon as `0x${string}`,
    logo: '/stocks/QQQ.png',
    isStable: false,
    decimals: 18,
  },
  {
    symbol: 'AMZNon',
    name: 'Amazon Tokenized',
    address: TOKEN_ADDRESSES.AMZNon as `0x${string}`,
    logo: '/stocks/AMZN.png',
    isStable: false,
    decimals: 18,
  },
];
