import { dryrun } from "@permaweb/aoconnect"
import { useQuery } from "@tanstack/react-query"

import { useActiveAddress } from "arweave-wallet-kit"

import type { Tag } from "@/types"

const useTokenBalance = (token: string | undefined) => {
  const userAddress = useActiveAddress()

  return useQuery({
    queryKey: ["tokenBalance", token, userAddress],
    queryFn: async () => {
      if (!userAddress) {
        throw new Error("No user address")
      }

      const result = await dryrun({
        process: token as string,
        Owner: userAddress,
        tags: [
          { name: "Action", value: "Balance" },
          { name: "Target", value: userAddress },
        ],
      })

      // check if there is something in result.Messages and pick the first one
      if (result.Messages.length > 0) {
        const message = result.Messages[0]
        // check if there is a balance tag
        const balanceTag = message.Tags.find((tag: Tag) => tag.name === "Balance")
        if (balanceTag) {
          return BigInt(balanceTag.value)
        }

        return 0n
      }

      return 0n
    },
    enabled: !!token,
  })
}

export default useTokenBalance
