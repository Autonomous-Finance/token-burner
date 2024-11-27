import { OrderType } from "./agents-api"
import { Tag } from "./ao"
import { dryrunDexiCU } from "./ao-connection"
import { DEXI_MONITOR_CONTRACT } from "./monitor-api"

export async function getVolumeByAgentType(agentType: OrderType): Promise<number> {
  const result = await dryrunDexiCU({
    process: DEXI_MONITOR_CONTRACT,
    tags: [
      { name: "Action", value: "Get-Historical-Volume" },
      {
        name: "Agent-Type",
        value: agentType,
      },
    ],
  })

  if (result.Messages.length === 0) throw new Error("No response from Get-AOCRED-Price")
  const message = result.Messages[0]

  const tags = message.Tags as Tag[]
  const tag = tags.find((x) => x.name === "TotalVolumeUSD")
  const valueAsString = tag?.value

  let value = parseFloat(valueAsString ? valueAsString : "")

  if (isNaN(value)) throw new Error("Response malformed")

  return value
}
