import { dryrun } from "@permaweb/aoconnect"

import { useQuery } from "@tanstack/react-query"

import { Message } from "@/api/ao"
import { getTagValue } from "@/utils/arweave"

export type Reserves = { [token: string]: bigint }

/**
 * Get pool reserves
 */
export async function getReserves(pool: string, pair: [string, string]) {
  const res = await dryrun({
    process: pool,
    Timestamp: 0,
    tags: [{ name: "Action", value: "Get-Reserves" }],
  })

  const a = 0,
    b = 1

  for (const msg of res.Messages as Message[]) {
    const tokenA = getTagValue(pair[a], msg.Tags)
    const tokenB = getTagValue(pair[b], msg.Tags)

    if (tokenA && tokenB) {
      return {
        [pair[a]]: BigInt(tokenA),
        [pair[b]]: BigInt(tokenB),
      }
    }
  }

  return {
    [pair[a]]: 0n,
    [pair[b]]: 0n,
  }
}

/**
 * Reserves hook
 */
export function useReserves(pool?: string, tokenA?: string, tokenB?: string) {
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["reserves", pool],
    queryFn: async (): Promise<Reserves> => {
      if (!pool || !tokenA || !tokenB) return {} as Reserves
      return await getReserves(pool, [tokenA, tokenB])
    },
    enabled: !!pool && !!tokenA && !!tokenB,
  })

  return [data, isLoading || isRefetching, refetch] as const
}
