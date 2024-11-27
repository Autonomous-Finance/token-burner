import { getActiveAddress } from "arweavekit/auth"
import { gql } from "urql"
import { DataItem } from "warp-arbundles"

import { AO_MIN_INGESTED_AT, goldsky } from "./graphql-client"
import { TransactionsResponse } from "../types"

export type UserSettings = {
  watchlist: string[]
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  watchlist: [],
}

const USER_SETTINGS_TAG = {
  name: "Dexi-User-Settings",
  value: "v0.0.1",
}

export async function persistToArweave(payload: UserSettings) {
  console.log("ArweavePersist: Persisting user settings")
  const data = JSON.stringify(payload)
  const tags = [
    {
      name: "Content-Type",
      value: "application/json",
    },
    USER_SETTINGS_TAG,
    {
      name: "Timestamp",
      value: new Date().getTime().toString(),
    },
  ]

  const signed = await (window.arweaveWallet as any).signDataItem({
    data,
    tags,
  })

  const dataItem = new DataItem(signed)

  // https://node2.bundlr.network/tx
  const response = await fetch(`https://upload.ardrive.io/v1/tx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: dataItem.getRaw(),
  })

  const bundle = await response.json()
  console.log("ArweavePersist: Persisted user settings", bundle)
}

const gqlQuery = gql`
  query ($userAddress: String!) {
    transactions(
      tags: [
        { name: "${USER_SETTINGS_TAG.name}", values: ["${USER_SETTINGS_TAG.value}"] }
      ]
      owners: [$userAddress]
      sort: INGESTED_AT_DESC
      first: 1
      ${AO_MIN_INGESTED_AT}
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
`

export async function getUserSettings(): Promise<UserSettings> {
  const userAddress = await getActiveAddress()

  if (!userAddress) {
    return DEFAULT_USER_SETTINGS
  }

  const result = await goldsky.query<TransactionsResponse>(gqlQuery, { userAddress }).toPromise()
  const { data } = result
  console.log("ArweavePersist: User settings bundle list:", data?.transactions.edges)

  if (data?.transactions.edges.length === 0) {
    return DEFAULT_USER_SETTINGS
  }

  const arweaveId = data?.transactions.edges[0].node.id
  console.log("ArweavePersist: Retrieved user settings bundle id:", arweaveId)
  const response = await fetch(`https://arweave.net/${arweaveId}`)

  const userSettings = (await response.json()) as UserSettings
  console.log("ArweavePersist: Retrieved user settings:", userSettings)
  return userSettings
}
