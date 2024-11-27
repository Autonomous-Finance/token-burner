import { dryrun } from "@permaweb/aoconnect"
import { useQuery } from "@tanstack/react-query"

import type { Tag } from "@/types"

const useTokenPrice = (pool: string, token: string, quantity: string) => {
  return useQuery({
    queryKey: ["tokenPrice", pool, token, quantity],
    queryFn: async () => {
      const result = await dryrun({
        process: pool,
        tags: [
          { name: "Action", value: "Get-Price" },
          { name: "Token", value: token },
          { name: "Quantity", value: quantity },
        ],
      })

      // check if there is something in result.Messages and pick the first one
      if (result.Messages.length > 0) {
        const message = result.Messages[0]

        // check if there is a balance tag
        const priceTag = message.Tags.find((tag: Tag) => tag.name === "Price")

        if (priceTag) {
          return BigInt(priceTag.value)
        }

        return 0n
      }

      return 0n
    },
    refetchInterval: 5000,
  })
}

export default useTokenPrice
