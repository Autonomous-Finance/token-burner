import { createDataItemSigner, message, result } from "@permaweb/aoconnect"

import { gql } from "urql"

import { dryrun } from "./ao-connection"
import { AO_MIN_INGESTED_AT, goldsky } from "./graphql-client"
import TOKENBURNER from "@/constants/TokenBurner_process"
import { AoMessage, TransactionsResponse } from "@/types"
import { messageFields, parseAoMessage } from "@/utils/arweave-utils"

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
    Ticker: string
    Name: string
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

const AllBurnsQuery = gql`
  query ($burnContractId: String!, $limit: Int!, $sortOrder: SortOrder!, $cursor: String) {
    transactions(
      sort: $sortOrder
      first: $limit
      after: $cursor
      tags: [
        { name: "Action", values: ["Burned"] }
        { name: "From-Process", values: [$burnContractId] }
      ]
      ${AO_MIN_INGESTED_AT}
    ) {
      ...MessageFields
    }
  }

  ${messageFields}
`

export async function getAllBurns(
  limit = 1000,
  cursor = "",
  ascending = false,
  sortField = "ingestedAt" satisfies keyof AoMessage,
): Promise<AoMessage[]> {
  const result = await goldsky
    .query<TransactionsResponse>(AllBurnsQuery, {
      burnContractId: TOKENBURNER,
      limit,
      sortOrder: ascending ? "INGESTED_AT_ASC" : "INGESTED_AT_DESC",
      cursor,
    })
    .toPromise()
  const { data } = result

  const burns = data?.transactions.edges.map(parseAoMessage)

  return burns || []
}
