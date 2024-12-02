import { OrderType } from "./api/agents-api"

export type Tag = {
  name: string
  value: string
}

export type Owner = {
  address: string
  key?: string
}

export type ArweaveBlock = {
  id: string
  timestamp: Date | null
  height: number
  previous?: string
  cursor?: string
}

export type TransactionNode = {
  id: string
  anchor?: string
  ingested_at: number
  signature?: string
  recipient: string
  owner: Owner
  fee?: {
    winston: string
    ar: string
  }
  quantity?: {
    winston: string
    ar: string
  }
  data?: {
    size?: number
    type?: string
  }
  tags: Tag[]
  block: BlockEdge["node"]
  parent?: {
    id: string
  }
  bundledIn?: {
    id: string
  }
}

export type TransactionEdge = {
  cursor: string
  node: TransactionNode
}

export type TransactionsResponse = {
  transactions: {
    count: number | undefined
    edges: TransactionEdge[]
  }
}

export type BlocksResponse = {
  blocks: {
    edges: BlockEdge[]
  }
}

export type BlockEdge = {
  cursor: string
  node: {
    id: string
    height: number
    previous?: string
    timestamp: number
  }
}

export type ArweaveAddress = string
export const MSG_TYPES = ["Message", "Process", "Checkpoint", "Assignment"] as const

export interface ArweaveTransaction {
  id: string
  blockHeight: number | null
  blockTimestamp: Date | null
  ingestedAt: Date
  tags: Record<string, string>
  cursor?: string
  dataSize?: number
}

export interface AoMessage extends ArweaveTransaction {
  action: string
  to: ArweaveAddress
  from: ArweaveAddress
  type: (typeof MSG_TYPES)[number]
  schedulerId: string
  systemTags: Record<string, string>
  userTags: Record<string, string>
}

export type UserAddress = ArweaveAddress

export interface AoProcess extends AoMessage {
  id: ArweaveAddress
  type: "Process"
}

export type PoolPair = {
  tokenA: string
  tokenB: string
}

export type PoolReserves = {
  baseToken: number
  quoteToken: number
  baseTokenAsString: string
  quoteTokenAsString: string
}

export type HighchartAreaData = [number, number]

// {
//   "start_timestamp": 1710522627,
//   "high": 0.91088,
//   "volume": 50000,
//   "end_timestamp": 1710522627,
//   "open": 0.91088,
//   "low": 0.91088,
//   "close": 0.91088,
//   "candle_time": "2024-03-15 17:00"
// }
export type Candle = {
  close: number
  end_timestamp: number
  high: number
  low: number
  open: number
  candle_time: string
  start_timestamp: number
  volume: number
}

export type TokensLockedDetails = {
  User: string
  Start: string
  End: string
  Period: string
  Amount: string
}

export type AgentType = OrderType | "portfolio"
