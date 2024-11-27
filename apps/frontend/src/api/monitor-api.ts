import { dryrun } from "./ao-connection"
import ENV from "@/env"

export const DEXI_MONITOR_CONTRACT = ENV.VITE_DEXI_PROCESS

// {
//   "price_6h_ago": 0.076353363366,
//   "price_1h_ago": 0.084161836479,
//   "market_cap_rank": 1,
//   "total_supply": 201047011,
//   "price_5m_ago": 0.084161836479,
//   "current_price": 0.084161836479,
//   "volume": 3611964,
//   "market_cap": 16920485.664374,
//   "amm_process": "U3Yy3MQ41urYMvSmzHsaA4hJEDuvIm-TgXvSm-wz-X0",
//   "token_name": "BARK",
//   "amm_name": "BARK/AOCRED",
//   "token0": "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc",
//   "token1": "8p7ApPZxC_37M06QHVejCQrKsHbcJEerd3jWNkDUWPQ",
//   "price_24h_ago": 0.15903307888,
//   "fixed_supply": 0,
//   "transactions": 22
// }
export type PoolOverviewRaw = {
  price_24h_ago: number
  price_5m_ago: number
  price_1h_ago: number
  price_6h_ago: number
  token0: string
  transactions: number
  amm_process: string
  current_price: number
  token1: string
  volume: number
  market_cap: number
  liquidity_usd: number
}

export type PoolOverview = {
  price5mAgo: number
  price1hAgo: number
  price6hAgo: number
  price24hAgo: number
  baseToken: string
  transactions: number
  poolId: string
  latestPrice: number
  quoteToken: string
  totalVolume: number
  marketCap: number
  liquidity_usd: number
}

export async function getOverview(): Promise<PoolOverview[]> {
  const result = await dryrun({
    process: DEXI_MONITOR_CONTRACT,
    tags: [{ name: "Action", value: "Get-Overview" }],
  })

  if (result.Messages.length === 0) throw new Error("No response from Get-Overview (pools)")
  const { Data: data } = result.Messages[0]

  const raw = JSON.parse(data) as PoolOverviewRaw[]
  console.log("Pool overview:", raw)

  const overviews: PoolOverview[] = raw.map((x: PoolOverviewRaw) => {
    return {
      marketCap: x.market_cap || 0,
      price5mAgo: x.price_5m_ago || 0,
      price1hAgo: x.price_1h_ago || 0,
      price6hAgo: x.price_6h_ago || 0,
      price24hAgo: x.price_24h_ago || 0,
      baseToken: x.token1,
      transactions: x.transactions || 0,
      poolId: x.amm_process,
      latestPrice: x.current_price || 0,
      quoteToken: x.token0,
      totalVolume: x.volume || 0,
      liquidity_usd: x.liquidity_usd || 0,
    }
  })

  return overviews.filter((x) => x.baseToken !== "SpzpFLkqPGvr5ZFZPbvyAtizthmrJ13lL4VBQIBL0dg") // afT
}
