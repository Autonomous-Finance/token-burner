import { createDataItemSigner, message, result } from "@permaweb/aoconnect"

import { dryrun } from "./ao-connection"

export type BurnEvent = {
  user: string
  amount: string
}

export async function getBurnEvents(burnProcess: string, tokenProcess: string) {
  const tags = [
    { name: "Action", value: "Get-Burns" },
    {
      name: "Token",
      value: tokenProcess,
    },
  ]

  try {
    const result = await dryrun({
      process: burnProcess,
      tags,
    })

    if (result.Messages.length === 0) throw new Error("No response from Get-Burns")

    const data = result.Messages[0].Data

    if (!data) throw new Error("Response malformed")

    const parsed = JSON.parse(data) as BurnEvent[]

    return parsed || null
  } catch (error) {
    return null
  }
}

export interface BurnTokensParams {
  tokenProcess: string
  burnProcess: string
  amount: string
}

export async function burnTokens(data: BurnTokensParams): Promise<string> {
  const messageId = await message({
    process: data.tokenProcess,
    signer: createDataItemSigner(window.arweaveWallet),
    tags: [
      { name: "Action", value: "Transfer" },
      { name: "Recipient", value: data.burnProcess },
      { name: "Quantity", value: data.amount },
    ],
  })

  console.log("onTransferId", messageId)

  const res = await result({
    message: messageId,
    process: data.tokenProcess,
  })

  if (res.Messages.length === 0 && res.Spawns.length === 0 && res.Output.data) {
    throw new Error(res.Output.data)
  }

  return messageId
}
