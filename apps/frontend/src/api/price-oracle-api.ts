import { dryrunDexiCU } from "./ao-connection"
import { DEXI_MONITOR_CONTRACT } from "./monitor-api"
import type { Tag } from "../types"
import ENV from "@/env"

export async function getNativeArPrice(): Promise<number> {
  const result = await dryrunDexiCU({
    process: DEXI_MONITOR_CONTRACT,
    tags: [
      { name: "Action", value: "Get-Oracle-Price" },
      {
        name: "Process-Id",
        value: ENV.VITE_WRAPPED_AR_PROCESS,
      },
    ],
  })

  if (result.Messages.length === 0) throw new Error("No response from Get-AOCRED-Price")
  const message = result.Messages[0]

  const tags = message.Tags as Tag[]
  const tag = tags.find((x) => x.name === "Price")
  const valueAsString = message.Data || tag?.value

  const value = Number.parseFloat(valueAsString ? valueAsString : "")

  if (Number.isNaN(value)) throw new Error("Response malformed")

  return value
}
