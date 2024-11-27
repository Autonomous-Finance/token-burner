import { dryrun } from "./ao-connection"
import { PoolReserves, Tag } from "../types"
import ENV from "@/env"

export type Pool = {
  id: string
  baseToken: string
  quoteToken: string
  created: number
  verified?: boolean
  status?: "private" | "public"
}

export async function getAllPools(): Promise<Pool[]> {
  const result = await dryrun({
    process: ENV.VITE_DEXI_PROCESS,
    tags: [{ name: "Action", value: "Get-Overview" }],
  })

  if (result.Messages.length === 0) throw new Error("No response from Get-Overview")

  const data = result.Messages[0].Data

  if (!data) throw new Error("Response malformed")

  type GetOverviewData = {
    price_6h_ago: number
    price_1h_ago: number
    market_cap_rank: number
    total_supply: number
    price_5m_ago: number
    token_name: string
    current_price: number
    amm_process: string
    market_cap: number
    amm_name: string
    token0: string
    token1: string
    price_24h_ago: number
    fixed_supply: number
    amm_discovered_at_ts?: number
    amm_status?: "private" | "public"
  }

  try {
    const pools: GetOverviewData[] = JSON.parse(data)
    const formattedPools: Pool[] = []

    for (const pool of pools) {
      formattedPools.push({
        created: pool.amm_discovered_at_ts ?? 0,
        id: pool.amm_process,
        baseToken: pool.token1,
        quoteToken: pool.token0,
        status: pool.amm_status || "private",
      })
    }

    return formattedPools
  } catch (error) {
    throw new Error("Response malformed")
  }
}

export async function getPoolById(poolId: string): Promise<Pool> {
  return (await getAllPools().then((pools) => pools.find((x) => x.id === poolId))) as Pool
}

export async function getOnchainPoolReserves(pool: Pool): Promise<PoolReserves> {
  const result = await dryrun({
    process: pool.id,
    tags: [{ name: "Action", value: "Get-Reserves" }],
  })

  if (result.Messages.length === 0)
    throw new Error(`No response from Get-Reserves (pool: ${pool.id})`)
  const tags = result.Messages[0].Tags as Tag[]

  const baseToken = tags.find((x) => x.name === pool.baseToken)?.value
  const quoteToken = tags.find((x) => x.name === pool.quoteToken)?.value

  if (!baseToken || !quoteToken) throw new Error("Response malformed")

  return {
    baseToken: Number.parseFloat(baseToken),
    quoteToken: Number.parseFloat(quoteToken),
  }
}

export async function getOnchainPoolFeePercentage(poolId: string): Promise<number> {
  const result = await dryrun({
    process: poolId,
    tags: [{ name: "Action", value: "Get-Fee-Percentage" }],
  })

  if (result.Messages.length === 0)
    throw new Error(`No response from Get-Fee-Percentage (pool: ${poolId})`)

  const tags = result.Messages[0].Tags as Tag[]
  const tag = tags.find((x) => x.name === "Fee-Percentage")
  let value = parseFloat(tag ? tag.value : "")

  if (isNaN(value)) throw new Error("Response malformed")

  return value
}

// dryrun({ process: poolId, tags: [{ name: "Action", value: "Get-Price" }] }),
