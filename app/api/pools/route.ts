import { NextResponse } from "next/server"

export async function GET() {
  const pools = [
    {
      id: "pool_1",
      asset: "TSLAon",
      underlying: "Tesla (TSLA)",
      tvl: "$4,250,820",
      apy: "Stock Appreciation",
      status: "ACTIVE"
    },
    {
      id: "pool_2",
      asset: "NVDAon",
      underlying: "Nvidia (NVDA)",
      tvl: "$12,890,500",
      apy: "Stock Appreciation",
      status: "ACTIVE"
    },
    {
      id: "pool_3",
      asset: "SPYon",
      underlying: "S&P 500 (SPY)",
      tvl: "$52,512,800",
      apy: "Market Index",
      status: "ACTIVE"
    },
    {
      id: "pool_4",
      asset: "QQQon",
      underlying: "Nasdaq 100 (QQQ)",
      tvl: "$34,432,100",
      apy: "Market Index",
      status: "ACTIVE"
    }
  ]

  return NextResponse.json({ pools })
}
