import { createDataItemSigner, message, result } from "@permaweb/aoconnect"

import { dryrun } from "./ao-connection"

export type NewAgentBlueprint = {
  name: string
  description: string
  sourceCode: string
  userInterface: string
  authorName: string
  version: string
  logo?: string
  developerFeeAddress: string
  developerFeeBps: number
}

export type AgentBlueprint = NewAgentBlueprint & {
  id: string
  authorAddress: string
  totalAgents: number
  activeAgents: number
}

export const AGENT_MARKETPLACE = "ENV.VITE_DEXI_MARKETPLACE_CONTRACT"

export async function getAgentBlueprints() {
  const result = await dryrun({
    process: AGENT_MARKETPLACE,
    tags: [{ name: "Action", value: "Get-Blueprints" }],
  })
  // console.log("📜 LOG > getAgentBlueprints > result:", result)
  if (result.Messages.length === 0) throw new Error("No response from Get-Blueprints")

  const { Data: data } = result.Messages[0]
  const parsed = JSON.parse(data) as AgentBlueprint[]

  console.log("📜 LOG > getAgentBlueprints:", parsed)
  return parsed
}

export async function getAgentBlueprintById(id: string) {
  return (await getAgentBlueprints()).find((x) => x.id === id) // TODO
}

export async function addAgentBlueprint(newBlueprint: NewAgentBlueprint) {
  const blueprintId = await message({
    process: AGENT_MARKETPLACE,
    data: JSON.stringify(newBlueprint),
    signer: createDataItemSigner(window.arweaveWallet),
    tags: [{ name: "Action", value: "Add-Blueprint" }],
  })

  // console.log("📜 LOG > addAgentBlueprint > result:", blueprintId)

  const { Error: err } = await result({
    message: blueprintId,
    process: AGENT_MARKETPLACE,
  })

  if (err) throw new Error(err)

  return blueprintId
}

export async function updateAgentBlueprint(
  update: Partial<AgentBlueprint> & Pick<AgentBlueprint, "id">,
) {
  const msgId = await message({
    process: AGENT_MARKETPLACE,
    data: JSON.stringify(update),
    signer: createDataItemSigner(window.arweaveWallet),
    tags: [{ name: "Action", value: "Update-Blueprint" }],
  })

  // console.log("📜 LOG > updateAgentBlueprint > result:", msgId)

  const { Error: err } = await result({
    message: msgId,
    process: AGENT_MARKETPLACE,
  })

  if (err) throw new Error(err)

  return msgId
}
