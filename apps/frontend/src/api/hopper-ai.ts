import { dryrun } from "@permaweb/aoconnect"

import ENV from "@/env"

export async function getTokenPrice(tokenProcess: string, type: "usd" | "token"): Promise<number> {
  const result = await dryrun({
    process: ENV.VITE_DEXI_PROCESS,
    tags: [
      {
        name: "Action",
        value: "Get-Price-For-Token",
      },
      {
        name: "Quote-Token-Process",
        value: type === "usd" ? "USD" : tokenProcess,
      },
      {
        name: "Base-Token-Process",
        value: type === "usd" ? tokenProcess : "USD",
      },
    ],
  })

  if (result.Messages.length === 0) throw new Error("No response from Token-By-Process")

  const data = result.Messages[0].Tags.find(
    (tag: { name: string; value: string }) => tag.name === "Price",
  )?.value

  if (!data) throw new Error("Response malformed")

  return Number(data)
}
