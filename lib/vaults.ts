import { TOKEN_ADDRESSES } from './tokenAddresses';

export interface Vault {
  id: string;
  symbol: string;
  name: string;
  underlying: string;
  color: string;
  category: 'TECH' | 'ETF' | 'BLUE_CHIPS';
  baseApy: number;
  dailyYield: number;
  tvl: number;
  description: string;
  platform: string;
  tokenName: string;
  tokenAddress: string;
}

export const VAULTS: Vault[] = [
  {
    id: 'tslax',
    symbol: 'TSLAx',
    tokenName: 'MockTSLAx',
    tokenAddress: TOKEN_ADDRESSES.TSLAx,
    name: 'Tesla Inc',
    underlying: 'TSLA',
    color: '#E31937',
    category: 'TECH',
    baseApy: 12.4,
    dailyYield: 0.034,
    tvl: 1245000,
    platform: 'Tesla Inc',
    description: "Tesla, Inc. is the world's leading electric vehicle manufacturer and clean energy company, led by Elon Musk. It designs and manufactures electric vehicles, battery energy storage from home to grid-scale, solar panels and solar roof tiles, and related products and services."
  },
  {
    id: 'aaplx',
    symbol: 'AAPLx',
    tokenName: 'MockAAPLx',
    tokenAddress: TOKEN_ADDRESSES.AAPLx,
    name: 'Apple Inc',
    underlying: 'AAPL',
    color: '#A0A0A0',
    category: 'TECH',
    baseApy: 8.2,
    dailyYield: 0.022,
    tvl: 2150000,
    platform: 'Apple Inc',
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. Its signature products include the iPhone, Mac, iPad, and Apple Watch, supported by a robust ecosystem of services including the App Store and iCloud."
  },
  {
    id: 'nvdaon',
    symbol: 'NVDAon',
    tokenName: 'MockNVDAon',
    tokenAddress: TOKEN_ADDRESSES.NVDAon,
    name: 'NVIDIA Corp',
    underlying: 'NVDA',
    color: '#76B900',
    category: 'TECH',
    baseApy: 18.7,
    dailyYield: 0.051,
    tvl: 3420000,
    platform: 'NVIDIA Corp',
    description: "NVIDIA Corporation is the leading GPU and AI chip manufacturer, powering the modern AI revolution. The company's hardware and software are essential for gaming, professional visualization, data centers, and automotive markets, with a dominant position in high-performance computing."
  },
  {
    id: 'googlx',
    symbol: 'GOOGLx',
    tokenName: 'MockGOOGLx',
    tokenAddress: TOKEN_ADDRESSES.GOOGLx,
    name: 'Alphabet Inc',
    underlying: 'GOOGL',
    color: '#4285F4',
    category: 'TECH',
    baseApy: 9.1,
    dailyYield: 0.025,
    tvl: 1890000,
    platform: 'Alphabet Inc',
    description: "Alphabet Inc. operates Google, YouTube, and Google Cloud, dominating the global search engine and online advertising markets. The company invests heavily in artificial intelligence, autonomous driving (Waymo), and other forward-looking 'moonshot' projects."
  },
  {
    id: 'spyx',
    symbol: 'SPYx',
    tokenName: 'MockSPYx',
    tokenAddress: TOKEN_ADDRESSES.SPYx,
    name: 'S&P 500 ETF',
    underlying: 'SPY',
    color: '#F58220',
    category: 'ETF',
    baseApy: 6.3,
    dailyYield: 0.017,
    tvl: 5600000,
    platform: 'S&P 500 ETF',
    description: "SPDR S&P 500 ETF tracks the performance of 500 large US companies across all sectors. It is one of the most liquid and widely traded ETFs globally, providing broad exposure to the US equity market and serving as a benchmark for investment performance."
  },
  {
    id: 'crclx',
    symbol: 'CRCLX',
    tokenName: 'MockCRCLX',
    tokenAddress: TOKEN_ADDRESSES.CRCLX,
    name: 'Circle',
    underlying: 'CRCL',
    color: '#800080',
    category: 'BLUE_CHIPS',
    baseApy: 11.2,
    dailyYield: 0.031,
    tvl: 980000,
    platform: 'Circle',
    description: "Circle Internet Financial is the issuer of USDC stablecoin and a leader in digital currency innovation. Circle's mission is to raise global economic prosperity through the frictionless exchange of value, providing the infrastructure for the next generation of financial services."
  },
  {
    id: 'muon',
    symbol: 'MUon',
    tokenName: 'MockMUon',
    tokenAddress: TOKEN_ADDRESSES.MUon,
    name: 'Micron Tech',
    underlying: 'MU',
    color: '#008080',
    category: 'TECH',
    baseApy: 15.8,
    dailyYield: 0.043,
    tvl: 750000,
    platform: 'Micron Tech',
    description: "Micron Technology is a leading producer of memory semiconductors, including DRAM and NAND flash. Its products are essential components in everything from high-end smartphones and PCs to massive data centers and industrial electronics."
  },
  {
    id: 'qqqon',
    symbol: 'QQQon',
    tokenName: 'MockQQQon',
    tokenAddress: TOKEN_ADDRESSES.QQQon,
    name: 'Nasdaq 100 ETF',
    underlying: 'QQQ',
    color: '#4B0082',
    category: 'ETF',
    baseApy: 7.9,
    dailyYield: 0.022,
    tvl: 4200000,
    platform: 'Nasdaq 100 ETF',
    description: "Invesco QQQ Trust tracks the Nasdaq-100 index of tech giants and growth companies. It provides exposure to the most innovative companies in sectors like technology, consumer services, and healthcare, excluding financial companies."
  },
  {
    id: 'amznon',
    symbol: 'AMZNon',
    tokenName: 'MockAMZNon',
    tokenAddress: TOKEN_ADDRESSES.AMZNon,
    name: 'Amazon.com Inc',
    underlying: 'AMZN',
    color: '#FFBF00',
    category: 'TECH',
    baseApy: 10.3,
    dailyYield: 0.028,
    tvl: 2800000,
    platform: 'Amazon.com Inc',
    description: "Amazon.com is the world's largest e-commerce and cloud computing company (AWS). Beyond retail, it has significantly expanded into digital streaming, artificial intelligence, and logistics, maintaining a massive global footprint and customer base."
  }
];

export function getVaultById(id: string) {
  return VAULTS.find(v => v.id.toLowerCase() === id.toLowerCase());
}
