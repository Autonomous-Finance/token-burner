import { dryrun } from "@permaweb/aoconnect"
import { useQuery } from "@tanstack/react-query"

import ENV from "@/env"
import type { Tag } from "@/types"

async function getCommunityApproved(token: string): Promise<boolean> {
  const result = await dryrun({
    process: ENV.VITE_DEXI_PROCESS,
    tags: [{ name: "Action", value: "Get-Community-Approved-Tokens" }],
  })

  if (result.Messages.length === 0)
    throw new Error("No response from Get-Community-Approved-Tokens")

  const tags = result.Messages[0].Tags

  // check for Community-Approved-Tokens tag name and return it's values
  const data = tags.find((tag: Tag) => tag.name === "Community-Approved-Tokens")?.value as string[]

  if (!data) throw new Error("Response malformed")

  // Check if token is in the list of approved tokens
  const approved = data.includes(token)

  return approved
}

const useCommunityApproved = (token: string | undefined) => {
  return useQuery({
    queryKey: ["Get-Community-Approved-Tokens", token],
    queryFn: () => getCommunityApproved(token as string),
    enabled: !!token,
  })
}

export default useCommunityApproved
