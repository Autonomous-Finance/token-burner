import { dryrun } from "@permaweb/aoconnect"
import { useQuery } from "@tanstack/react-query"

import ENV from "@/env"

interface LockedShare {
  "Current-Tvl": number
  "Aggregate-Locked-Tokens": {
    locked_till_date: string
    locked_tokens: string
  }[]
  "One-Year-Locked-Share": number
  "One-Year-Locked-Liquidity": number
}

async function getLockedLiquidity(poolId: string): Promise<LockedShare> {
  const result = await dryrun({
    process: ENV.VITE_DEXI_PROCESS,
    tags: [
      { name: "Action", value: "Get-Locked-Share" },
      { name: "AMM-Process", value: poolId },
    ],
  })

  if (result.Messages.length === 0) throw new Error("No response from Get-Locked-Share")

  const data = result.Messages[0].Data

  if (!data) throw new Error("Response malformed")

  const tokenDetailsR: LockedShare = JSON.parse(data)

  return tokenDetailsR
}

const useLockedShare = (poolId: string | undefined) => {
  return useQuery({
    queryKey: ["Get-Locked-Share", poolId],
    queryFn: () => getLockedLiquidity(poolId as string),
    enabled: !!poolId,
  })
}

export default useLockedShare
