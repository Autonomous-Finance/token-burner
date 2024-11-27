import { gql } from "urql"

import { AO_MIN_INGESTED_AT, goldsky } from "./graphql-client"
import { TransactionsResponse } from "../types"
import { messageFields } from "../utils/arweave-utils"

const AllSwapsQuery = gql`
  query ($poolId: String!, $limit: Int!, $sortOrder: SortOrder!, $cursor: String, $traders: [String!]) {
    transactions(
      sort: $sortOrder
      first: $limit
      after: $cursor

      tags: [
        { name: "Action", values: ["Order-Confirmation"] }
        { name: "From-Process", values: [$poolId] }
        { name: "Relay-To", values: $traders }
      ]
      ${AO_MIN_INGESTED_AT}
    ) {
      ...MessageFields
    }
  }

  ${messageFields}
`

export type Swap = {
  cursor: string
  id: string
  fromToken: string
  toToken: string
  fee: string
  fromQuantity: number
  toQuantity: number
  tags: Record<string, string>
  ingestedAt: number
  from: string
  reservesA: number
  reservesB: number
}

export async function getAllSwaps(
  limit = 1000,
  cursor = "",
  ascending = false,
  sortField = "ingestedAt" satisfies keyof Swap,
  poolId: string,
  traders?: string[],
): Promise<Swap[]> {
  const result = await goldsky
    .query<TransactionsResponse>(AllSwapsQuery, {
      poolId,
      limit,
      sortOrder: ascending ? "INGESTED_AT_ASC" : "INGESTED_AT_DESC",
      cursor,
      traders,
    })
    .toPromise()
  const { data } = result

  const swaps = data?.transactions.edges.map((edge: any) => {
    const cursor = edge.cursor
    const node = edge.node
    const tags = node.tags.reduce((acc: Record<string, string>, tag: any) => {
      acc[tag.name] = tag.value
      return acc
    }, {})

    const fromToken = tags["From-Token"]
    const toToken = tags["To-Token"]
    const fee = tags["Fee"]
    const fromQuantity = parseFloat(tags["From-Quantity"])
    const toQuantity = parseFloat(tags["To-Quantity"])
    const reservesA = parseFloat(tags["Reserves-Token-A"])
    const reservesB = parseFloat(tags["Reserves-Token-B"])
    // const from = tags["Pushed-For"]
    const from = tags["Relay-To"]

    delete tags["From-Token"]
    delete tags["To-Token"]
    delete tags["Fee"]
    delete tags["From-Quantity"]
    delete tags["To-Quantity"]
    // delete tags["Pushed-For"]

    const ingestedAt = node.ingested_at * 1000

    return {
      cursor,
      id: node.id,
      fromToken,
      toToken,
      fee,
      fromQuantity,
      toQuantity,
      tags,
      ingestedAt,
      from,
      reservesA,
      reservesB,
    } satisfies Swap
  })

  // TODO FIXME
  if (poolId === "IMcN3R14yThfHzgbYzBDuuSpzmow7zGyBHRE3Gwrtsk") {
    return swaps?.filter((x) => x.ingestedAt >= 1716455522000) || []
  }

  return swaps || []
}
