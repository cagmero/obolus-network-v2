import { NextResponse } from "next/server"

export async function GET() {
  const transactions = [
    {
      id: "tx_1",
      title: "VAULT_DEPOSIT",
      amount: "42.50",
      asset: "NVDAon",
      status: "CONFIRMED",
      date: "2M AGO"
    },
    {
      id: "tx_2",
      title: "VAULT_WITHDRAW",
      amount: "2.15",
      asset: "TSLAon",
      status: "CONFIRMED",
      date: "1H AGO"
    },
    {
      id: "tx_3",
      title: "BALANCE_REVEAL",
      amount: "VAULT_v1",
      asset: "SYS_CALL",
      status: "COMPLETED",
      date: "4H AGO"
    },
    {
      id: "tx_4",
      title: "POSITION_UPDATE",
      amount: "890.50",
      asset: "SPYon",
      status: "CONFIRMED",
      date: "1D AGO"
    },
    {
      id: "tx_5",
      title: "VAULT_DEPOSIT",
      amount: "1,245.00",
      asset: "QQQon",
      status: "CONFIRMED",
      date: "2D AGO"
    }
  ]

  return NextResponse.json({ transactions })
}
