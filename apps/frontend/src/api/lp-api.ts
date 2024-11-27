import { gql } from "urql"

import { AO_MIN_INGESTED_AT, goldsky } from "./graphql-client"
import { Pool } from "./pools-api"
import { Tag, TransactionsResponse } from "../types"
import { messageFields } from "../utils/arweave-utils"

const AllBurnsQuery = gql`
  query ($poolId: String!) {
    transactions(
      tags: [{ name: "Burned-Pool-Tokens" }, { name: "From-Process", values: [$poolId] }]
      sort: INGESTED_AT_DESC
      first: 100
      ${AO_MIN_INGESTED_AT}
    ) {
      ...MessageFields
    }
  }

  ${messageFields}
`
const AllProvidesQuery = gql`
  query ($poolId: String!) {
    transactions(
      tags: [
        { name: "Action", values: ["Provide-Confirmation"] }
        { name: "From-Process", values: [$poolId] }
      ]
      sort: INGESTED_AT_DESC
      first: 100
      ${AO_MIN_INGESTED_AT}
    ) {
      ...MessageFields
    }
  }

  ${messageFields}
`

export type Swap = {
  id: string
  fromToken: string
  toToken: string
  fee: string
  fromQuantity: number
  toQuantity: number
  tags: Record<string, string>
  ingestedAt: number
  from: string
}

export type LiquidityChange = {
  id: string
  type: "burn" | "provide"
  quantity: number
  baseTokenQuantity: number
  quoteTokenQuantity: number
  ingestedAt: number
  from: string
}

export async function getAllLiquidityChanges(pool: Pool): Promise<LiquidityChange[]> {
  const results = await Promise.all([
    goldsky.query<TransactionsResponse>(AllBurnsQuery, { poolId: pool.id }).toPromise(),
    goldsky.query<TransactionsResponse>(AllProvidesQuery, { poolId: pool.id }).toPromise(),
  ])
  const { data: burns } = results[0]
  const { data: provides } = results[1]

  const changes: LiquidityChange[] = []
  burns?.transactions.edges.forEach(({ node }: any) => {
    const quantity = parseFloat(node.tags.find((x: Tag) => x.name === "Burned-Pool-Tokens")?.value)
    const baseTokenQuantity = node.tags.find(
      (x: Tag) => x.name === `Withdrawn-${pool.baseToken}`,
    )?.value
    const quoteTokenQuantity = node.tags.find(
      (x: Tag) => x.name === `Withdrawn-${pool.quoteToken}`,
    )?.value

    const from = node.tags.find((x: Tag) => x.name === "Relay-To")?.value

    const ingestedAt = node.ingested_at * 1000

    changes.push({
      id: node.id,
      type: "burn",
      ingestedAt,
      quantity,
      from,
      baseTokenQuantity,
      quoteTokenQuantity,
    })
  })
  provides?.transactions.edges.forEach(({ node }: any) => {
    const quantity = parseFloat(
      node.tags.find((x: Tag) => x.name === "Received-Pool-Tokens")?.value,
    )
    const baseTokenQuantity = node.tags.find(
      (x: Tag) => x.name === `Provided-${pool.baseToken}`,
    )?.value
    const quoteTokenQuantity = node.tags.find(
      (x: Tag) => x.name === `Provided-${pool.quoteToken}`,
    )?.value
    const from = node.tags.find((x: Tag) => x.name === "Relay-To")?.value

    const ingestedAt = node.ingested_at * 1000

    changes.push({
      id: node.id,
      type: "provide",
      ingestedAt,
      quantity,
      from,
      baseTokenQuantity,
      quoteTokenQuantity,
    })
  })

  changes.sort((a, b) => a.ingestedAt - b.ingestedAt)

  // TODO FIXME
  if (pool.id === "IMcN3R14yThfHzgbYzBDuuSpzmow7zGyBHRE3Gwrtsk") {
    return changes.filter((x) => x.ingestedAt >= 1716455522000)
  }

  return changes
}
