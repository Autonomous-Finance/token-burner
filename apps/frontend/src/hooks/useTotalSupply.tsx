import { dryrun } from "@permaweb/aoconnect"

import { QueryObserverResult, useQuery } from "@tanstack/react-query"

import { Message } from "@/api/ao"
import { getTagValue } from "@/utils/arweave"

/**
 * Get token total supply
 */
export async function getTotalSupply(id: string) {
  const res = await dryrun({
    process: id,
    tags: [{ name: "Action", value: "Total-Supply" }],
  })

  for (const msg of res.Messages as Message[]) {
    const totalSupply = getTagValue("Total-Supply", msg.Tags)
    if (totalSupply) return BigInt(totalSupply)
  }

  return 0n
}

/**
 * Total supply hook
 */
export function useTotalSupply(
  tokenId: string,
): [bigint, boolean, () => Promise<QueryObserverResult<bigint, Error>>] {
  const {
    data = 0n,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["total-supply", tokenId],
    queryFn: async () => {
      return await getTotalSupply(tokenId)
    },
    enabled: !!tokenId,
  })

  return [data, isLoading, refetch]
}
