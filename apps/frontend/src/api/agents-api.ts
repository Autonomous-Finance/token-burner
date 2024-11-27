import { dryrun } from "@permaweb/aoconnect"

import { Message } from "./ao"
import ENV from "@/env"

export type OrderType = "dca-order" | "limit-order" | "stop-order"

export interface OrderAgent {
  amm_process: string
  type: OrderType
  min_output?: string
  token_to: string
  id: string
  input: string
  expires_at_ts: number
  order_owner: string
  token_from: string
  pending: number
  created_at_ts: number
}

export async function getActiveOrders(activeAddr: string): Promise<OrderAgent[]> {
  const res = await dryrun({
    process: ENV.VITE_AGENT_FACTORY_PROCESS,
    Timestamp: 0,
    tags: [
      { name: "Action", value: "Get-Agents" },
      // { name: "Agent-Type", value: "limit-order" },
      { name: "Order-Owner", value: activeAddr },
      { name: "Progress-Filter", value: "pending" },
    ],
  })

  for (const msg of res.Messages as Message[]) {
    const val = JSON.parse(msg.Data)

    if (val) return val as OrderAgent[]
  }

  throw new Error("Response malformed")
}

type AgentStatus =
  | "AwaitingDeposit"
  | "Swapping"
  | "Complete"
  | "Expired"
  | "Ready"
  | "Canceled"
  | "AwaitingSubscription"

type Primitives = {
  "stop-limit-order"?: {
    "Filled-Price": string
    "Available-Input": string
    "Accumulated-Output": string
    "Token-To": string
    "Price-Precision": string
    "Is-Complete": boolean
    "Min-Output": string
    "Is-Initialized": boolean
    "Token-From": string
    Swaps: any[]
    Price: string
    "Filled-Percentage": string
  }
  "main-limit-order"?: {
    "Filled-Price": string
    "Available-Input": string
    "Accumulated-Output": string
    "Token-To": string
    "Price-Precision": string
    "Is-Complete": string
    "Min-Output": string
    "Is-Initialized": string
    "Token-From": string
    Swaps: any[]
    Price: string
    "Filled-Percentage": string
  }
  "stop-trigger": {
    "Is-Trailing": string //"false",
    "Last-Price-Received": string //"4159514090998682664"
    "Price-Precision": string //"18"
    "Token-To": string //"0udHxHUaSZI4aIs4hD6rF2jRas4G_XWYnn6JwxXd0II"
    "Is-Initialized": string //"true"
    "Token-From": string //"uc6uA_oCgDRNCSyweh1K8QBg4DqXBadZPBBxX82PxiQ"
    "Stop-Price": string //"4"
    "Was-Hit": string // "false"
    "Trigger-Direction": string //"Stop"
  }
}

type Strategy = {
  "Is-Trailing"?: "false" | "true"
  "Is-Stop-Limit"?: "false" | "true"
  "Has-Stop-Loss": "false" | "true"
  "Stop-Limit-Min-Output"?: string
  "Trailing-Difference"?: string
  Primitives?: Primitives
  "Min-Output": string
  // DCA order
  "Filled-Price"?: string
  "Filled-Percentage"?: string
  "Accumulated-Output"?: string
  "Stop-Price"?: string
}

export interface AgentInfo {
  "Agent-Type": "limit-order" | "dca-order"
  Status: AgentStatus
  "Has-Pending-Cancellation": "false" | "true"
  Strategy: Strategy
  "Token-From": string
  "Token-To": string
  Input: string
  "Order-Owner": string
  "Expires-At": string
}

export async function readAgentInfo(agentId: string): Promise<AgentInfo> {
  try {
    const res = await dryrun({
      process: agentId,
      Timestamp: 0,
      tags: [{ name: "Action", value: "Info" }],
    })

    const agentInfo = JSON.parse(res.Messages[0].Data) as AgentInfo
    return agentInfo
  } catch (e) {
    console.error(e)
    throw new Error("Agent Info not found")
  }
}
