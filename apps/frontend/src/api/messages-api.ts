import { gql } from "urql"

import { AO_MIN_INGESTED_AT, goldsky } from "./graphql-client"
import { AoMessage, TransactionsResponse } from "../types"
import { messageFields, parseAoMessage } from "../utils/arweave-utils"
import { isArweaveId } from "@/utils/arweave"

/**
 * WARN This query fails if both count and cursor are set
 */
const linkedMessagesQuery = (includeCount = false) => gql`
  query (
    $messageId: String!
    $limit: Int!
    $sortOrder: SortOrder!
    $cursor: String
  ) {
    transactions(
      sort: $sortOrder
      first: $limit
      after: $cursor

      tags: [{ name: "Pushed-For", values: [$messageId] }]
      ${AO_MIN_INGESTED_AT}
    ) {
      ${includeCount ? "count" : ""}
      ...MessageFields
    }
  }

  ${messageFields}
`
export async function getLinkedMessages(
  limit = 100,
  cursor = "",
  ascending: boolean,
  //
  pushedFor: string,
): Promise<[number | undefined, AoMessage[]]> {
  try {
    const result = await goldsky
      .query<TransactionsResponse>(linkedMessagesQuery(!cursor), {
        limit,
        sortOrder: ascending ? "INGESTED_AT_ASC" : "INGESTED_AT_DESC",
        cursor,
        //
        messageId: pushedFor,
      })
      .toPromise()
    const { data } = result

    if (!data) return [0, []]

    const { count, edges } = data.transactions
    const events = edges.map(parseAoMessage)

    return [count, events]
  } catch (error) {
    return [0, []]
  }
}

export async function getMessageById(id: string): Promise<AoMessage | undefined> {
  if (!isArweaveId(id)) {
    throw new Error("Invalid Arweave ID")
  }
  const { data, error } = await goldsky
    .query<TransactionsResponse>(
      gql`
        query ($id: ID!) {
          transactions(ids: [$id], ${AO_MIN_INGESTED_AT}) {
            ...MessageFields
          }
        }

        ${messageFields}
      `,
      { id },
    )
    .toPromise()

  if (error) throw new Error(error.message)

  if (!data) return
  if (!data.transactions.edges.length) return

  return parseAoMessage(data.transactions.edges[0])
}

/**
 * WARN This query fails if both count and cursor are set
 */
const dcaOrdersQuery = (includeCount = false) => gql`
  query (
    $entityId: String!
    $limit: Int!
    $sortOrder: SortOrder!
    $cursor: String
    $spawnMethod: String!
  ) {
    transactions(
      sort: $sortOrder
      first: $limit
      after: $cursor
      recipients: [$entityId]
      tags: [{ name: "Action", values: [$spawnMethod] }]
      ${AO_MIN_INGESTED_AT}
    ) {
      ${includeCount ? "count" : ""}
      ...MessageFields
    }
  }

  ${messageFields}
`

export async function getDcaOrders(
  limit = 100,
  cursor = "",
  ascending: boolean,
  //
  entityId: string,
  spawnMethod: string,
): Promise<[number | undefined, AoMessage[]]> {
  try {
    const result = await goldsky
      .query<TransactionsResponse>(dcaOrdersQuery(!cursor), {
        limit,
        sortOrder: ascending ? "INGESTED_AT_ASC" : "INGESTED_AT_DESC",
        cursor,
        //
        entityId,
        spawnMethod,
      })
      .toPromise()
    const { data } = result

    if (!data) return [0, []]

    const { count, edges } = data.transactions
    const events = edges.map(parseAoMessage)

    return [count, events]
  } catch (error) {
    return [0, []]
  }
}
