import { TOKEN_ADDRESSES } from './tokenAddresses';

// DeFi contract addresses — deployed on BSC Testnet
export const DEFI_ADDRESSES = {
  oUSD: '0x73b44a1C5e2c981594BA5dbb9d84edc905202f82' as `0x${string}`,
  ObolusAMM: '0x01E604F1D21Fc690A6fD9c2f7a27A5dA572cD8e4' as `0x${string}`,
  LendingPools: {
    TSLAx: '0x0e38d8069C194d6b12C6B6002f9286C91a0BcE91',
    AAPLx: '0x35d702B460150c09ae181A2129eab70428Dc8889',
    NVDAon: '0x3cfc330FB24A318fc619Ee8aE80DD3c9f92Dc65e',
    GOOGLx: '0xeD299858B4F95c30F3fceE9209fBbeA7138cE854',
    SPYx: '0x383FF0528b2c1Db2C5D439E5E64157851189ADC4',
    CRCLX: '0xC12a6bc96BDF45712b9eA72B39D968a8fc61f6B8',
    MUon: '0x94D2C848edF58cEE491f40afC28dCAb09d2fe26F',
    QQQon: '0x7a53B3eA7d5aEc8516698dA1bf21D4D0de5fC879',
    AMZNon: '0x617d818dc900Bb6fAa8f8F56979fD22f54E910e7',
  } as Record<string, `0x${string}`>, // Deployed on BSC Testnet

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
    logo: '/logo-only.png',
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
