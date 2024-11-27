import { gql } from "urql"

import { AO_MIN_INGESTED_AT, goldsky } from "./graphql-client"
import { TransactionEdge, TransactionsResponse } from "../types"
import { flattenTags } from "../utils/arweave"
import { messageFields } from "../utils/arweave-utils"
import ENV from "@/env"

export type ActivityAction =
  | "Burn-Confirmation"
  | "Burn-Error"
  | "Provide-Confirmation"
  | "Provide-Error"
  | "Order-Confirmation"
  | "Order-Error"
  | "Limit-Order-Confirmation"
  | "Limit-Order-Error"
  | "DCA-Order-Confirmation"
  | "DCA-Order-Error"
  | "Add-Pool-Confirmation"
  | "Add-Pool-Error"
  | "Stop-Order-Confirmation"
  | "Stop-Error-Confirmation"

export type ProvideOrderInfo = {
  tokenA: string
  tokenAAmount: string
  tokenB: string
  tokenBAmount: string
}
export type ProvideOrderErrorInfo = ProvideOrderInfo
export type BurnOrderInfo = ProvideOrderInfo
export type BurnErrorOrderInfo = {
  burnQuantity: string
  burnToken: string
}
export type SwapOrderInfo = {
  fromToken: string
  fromQuantity: string
  toToken: string
  toQuantity: string
}
export type SwapOrderErrorInfo = SwapOrderInfo
export type LimitOrderInfo = SwapOrderInfo & {
  filledPrice: string
  filledPercentage: string
}
export type StopLossOrderInfo = SwapOrderInfo & {
  filledPrice?: string
  filledPercentage?: string
  variant: string
}
export type LimitOrderErrorInfo = LimitOrderInfo

export type Activity = {
  action: ActivityAction
  txId: string
  poolId: string
  agentId?: string
  orderInfo?:
    | SwapOrderInfo
    | SwapOrderErrorInfo
    | ProvideOrderInfo
    | ProvideOrderErrorInfo
    | BurnOrderInfo
    | BurnErrorOrderInfo
    | LimitOrderInfo
    | LimitOrderErrorInfo
    | StopLossOrderInfo
  timestamp: number
  errorMessage?: string
  //
  cursor?: string
}

const allActivityQuery = (includeCount = false) => gql`
  query (
    $senders: [String!]!
    $userAddress: String!
    $limit: Int!
    $sortOrder: SortOrder!
    $cursor: String
  ) {
    transactions(
      sort: $sortOrder
      first: $limit
      after: $cursor

      tags: [
        {
          name: "Action"
          values: [
            "Order-Confirmation"
            "Order-Error"
            "Provide-Confirmation"
            "Provide-Error"
            "Burn-Confirmation"
            "Burn-Error"
            "Botega-Order-Confirmation"
            "Botega-Order-Error"
            "Add-Pool-Confirmation"
            "Add-Pool-Error"
          ]
        },
        { name: "From-Process", values: $senders }
      ]

      recipients: [$userAddress]
      ${AO_MIN_INGESTED_AT}
    ) {
      ${includeCount ? "count" : ""}
      ...MessageFields
    }
  }

  ${messageFields}
`

export async function getActivity(
  limit = 100,
  cursor = "",
  ascending: boolean,
  //
  userAddress: string,
): Promise<[number | undefined, Activity[]]> {
  try {
    const result = await goldsky.query<TransactionsResponse>(allActivityQuery(!cursor), {
      senders: [
        ENV.VITE_AMM_FACTORY_PROCESS,
        ENV.VITE_AGENT_FACTORY_PROCESS,
        //
      ],
      sortOrder: ascending ? "INGESTED_AT_ASC" : "INGESTED_AT_DESC",
      limit,
      cursor,
      //
      userAddress,
    })
    const { data } = result

    if (!data) return [0, []]

    const { count, edges } = data.transactions

    const activities = edges.map(parseActivity).filter((activity) => activity !== null)

    return [count, activities]
  } catch (e) {
    console.error(e)
    return [0, []]
  }
}

function parseActivity(edge: TransactionEdge): Activity {
  const { node, cursor } = edge

  const tags = flattenTags(node.tags)

  const activity: Activity = {
    txId: node.id,
    action: tags.Action as Activity["action"],
    timestamp: node.ingested_at,
    poolId: tags["Relayed-From"],
  }

  switch (tags.Action) {
    case "Add-Pool-Error":
    case "Add-Pool-Confirmation":
      activity.orderInfo = {
        tokenA: tags["Token-A"],
        tokenAAmount: "0",
        tokenB: tags["Token-B"],
        tokenBAmount: "0",
      }
      break
    case "Order-Error":
    case "Order-Confirmation":
      activity.orderInfo = {
        fromToken: tags["From-Token"],
        fromQuantity: tags["From-Quantity"],
        toToken: tags["To-Token"],
        toQuantity: tags["To-Quantity"],
      }
      break
    case "Burn-Error":
      activity.orderInfo = {
        burnQuantity: tags["Burn-Quantity"],
        burnToken: tags["Relayed-From"],
      }
      break
    case "Provide-Confirmation":
    case "Burn-Confirmation":
    case "Provide-Error":
      activity.orderInfo = {
        tokenA: tags["Token-A"],
        tokenAAmount: tags["Token-A-Quantity"],
        tokenB: tags["Token-B"],
        tokenBAmount: tags["Token-B-Quantity"],
      }
      break
    case "Botega-Order-Confirmation":
    case "Botega-Order-Error":
      if (tags["Agent-Type"] === "dca-order") {
        activity.orderInfo = {
          fromToken: tags["Token-From"],
          fromQuantity: tags["Input"],
          toToken: tags["Token-To"],
          toQuantity: tags["Accumulated-Output"] || "0",
          filledPrice: tags["Filled-Price"] || "n/A",
          filledPercentage: tags["Filled-Percentage"] || "0",
        } satisfies LimitOrderInfo
        activity.action = tags.Action.includes("Error")
          ? "DCA-Order-Confirmation"
          : "DCA-Order-Confirmation"
      } else if (tags["Agent-Type"] === "stop-order") {
        activity.orderInfo = {
          fromToken: tags["Token-From"],
          fromQuantity: tags["Input"],
          toToken: tags["Token-To"],
          toQuantity: tags["Output"],
          filledPrice: tags["Filled-Price"] || "n/A",
          filledPercentage: tags["Filled-Percentage"] || "0",
          // Is-Stop-Limit:true
          variant:
            tags["Is-Stop-Limit"] === "true"
              ? "limit"
              : tags["Is-Trailing"]
                ? "trailing"
                : "market",
        } satisfies StopLossOrderInfo
        activity.action = tags.Action.includes("Error")
          ? "Stop-Order-Confirmation"
          : "Stop-Order-Confirmation"
      } else {
        activity.orderInfo = {
          fromToken: tags["Token-From"],
          fromQuantity: tags["Input"],
          toToken: tags["Token-To"],
          toQuantity: tags["Min-Output"],
          filledPrice: tags["Filled-Price"] || "n/A",
          filledPercentage: tags["Filled-Percentage"] || "0",
        } satisfies LimitOrderInfo
        activity.action = tags.Action.includes("Error")
          ? "Limit-Order-Confirmation"
          : "Limit-Order-Confirmation"
      }
      break
    default:
      break
  }

  if (tags.Action.includes("Error")) {
    activity.errorMessage = tags["Result"] || tags["Error"] || tags["Status"] || "Unknown"
  }

  activity.cursor = cursor

  return activity
}
