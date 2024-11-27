import { createDataItemSigner, message, result } from "@permaweb/aoconnect"

import { dryrun } from "./ao-connection"

export type BurnStats = {
  totalBurnEvents: number
  perTokenStats: {
    [tokenId: string]: {
      numBurns: number
      totalBurned: string
    }
  }
  totalAmountBurned: string
}

export async function getBurnStats(burnProcess: string) {
  const tags = [{ name: "Action", value: "Info" }]

  try {
    const result = await dryrun({
      process: burnProcess,
      tags,
    })

    if (result.Messages.length === 0) throw new Error("No response from Info (getStats)")

    const data = result.Messages[0].Data

    if (!data) throw new Error("Response malformed")

    const parsed = JSON.parse(data) as BurnStats

    return parsed || null
  } catch (error) {
    return null
  }
}

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

type BurnHistoryEntry = {
  amount: string
  user: string
}

type LpToken = {
  LpToken: string
  Details: {
    TokenA: string
    TokenB: string
    Denomination: string
  }
  BurnHistory: BurnHistoryEntry[]
}

export async function getBurnedLpTokens(burnProcess: string, tokenProcess: string) {
  const tags = [
    { name: "Action", value: "Get-LP-Burn-History" },
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

    if (result.Messages.length === 0) throw new Error("No response from Get-LP-Burn-History")

    const data = result.Messages[0].Data

    if (!data) throw new Error("Response malformed")

    const parsed = JSON.parse(data) as LpToken[]

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
