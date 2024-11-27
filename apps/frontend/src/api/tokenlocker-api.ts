import { createDataItemSigner, message, result } from "@permaweb/aoconnect"

import { dryrun } from "./ao-connection"
import ENV from "@/env"

type RootTags = {
  "Agent-Owner": string
  Status: string
  "Agent-Factory": string
  Dexi: string
}

type RewardsModule = {
  RewardsToken: string
  TotalDistributedRewards: string
  EpochTime: string
  RewardsPerEpoch: string
  AvailableRewards: string
  StartTime: string
  Epochs: string
  MinPeriodForRewards: string
}

type LockModule = {
  TotalLocked: string
  LPToken: string
}

type LockerInfo = {
  rootTags: RootTags
  "Rewards-Module": RewardsModule
  "Lock-Module": LockModule
}

export async function getInfo(): Promise<LockerInfo> {
  const result = await dryrun({
    process: ENV.VITE_AGENT_LOCKER_PROCESS,
    tags: [{ name: "Action", value: "Info" }],
  })

  if (result.Messages.length === 0) throw new Error("No response from Locked-Tokens")

  const data = result.Messages[0].Data

  if (!data) throw new Error("Response malformed")

  const tokenDetails: LockerInfo = JSON.parse(data)

  return tokenDetails
}

export type TokenLocking = {
  LockEnd: number
  CanWithdraw: boolean
  LockPeriod: number
  Amount: string
  Start: number
}

export type LockedTokensData = {
  User: string
  TokensLocked: TokenLocking[]
  TotalLocked: string
}

export async function getUserLockedTokens(userAddress: string) {
  const tags = [
    { name: "Action", value: "Get-User-Locked-Tokens" },
    { name: "User", value: userAddress as string },
  ]

  try {
    const result = await dryrun({
      process: ENV.VITE_AGENT_LOCKER_PROCESS,
      tags,
    })

    if (result.Messages.length === 0) throw new Error("No response from Get-User-Locked-Tokens")

    const data = result.Messages[0].Data

    if (!data) throw new Error("Response malformed")

    const tokenDetails = JSON.parse(data) as LockedTokensData

    return tokenDetails || null
  } catch (error) {
    return null
  }
}

export type RewardsData = {
  EpochRewards: string
  AvailableUserRewards: string
  LastClaim: {
    Amount: string
    Timestamp: number
  }
  User: string
  RewardsModule: {
    EpochTime: number
    EpochsPassed: string
  }
  UserShare: {
    EligibleLockedTokens: string
    EligibleSharePercentage: string
  }
  TotalClaimed: string
}

export async function getUserRewards(userAddress: string) {
  const tags = [
    { name: "Action", value: "Get-User-Rewards" },
    { name: "User", value: userAddress as string },
  ]

  try {
    const result = await dryrun({
      process: ENV.VITE_AGENT_LOCKER_PROCESS,
      tags,
    })

    if (result.Messages.length === 0) throw new Error("No response from Get-User-Rewards")

    const data = result.Messages[0].Data

    if (!data) throw new Error("Response malformed")

    const tokenDetails = JSON.parse(data) as RewardsData

    return tokenDetails || null
  } catch (error) {
    return null
  }
}

export interface LockTokensParams {
  tokenProcess: string
  amount: bigint
  periodMs: number
}

export async function lockTokens(data: LockTokensParams): Promise<string> {
  const messageId = await message({
    process: data.tokenProcess,
    signer: createDataItemSigner(window.arweaveWallet),
    tags: [
      { name: "Action", value: "Transfer" },
      { name: "Recipient", value: ENV.VITE_AGENT_LOCKER_PROCESS },
      { name: "Quantity", value: data.amount.toString() },
      { name: "X-Action", value: "Lock-Tokens" },
      { name: "X-Period", value: data.periodMs.toString() },
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

export async function withdrawTokens(tokenProcess: string, amount: bigint): Promise<string> {
  const messageId = await message({
    process: ENV.VITE_AGENT_LOCKER_PROCESS,
    signer: createDataItemSigner(window.arweaveWallet),
    tags: [
      { name: "Action", value: "Withdraw-Tokens" },
      // { name: "Token", value: tokenProcess },
      { name: "Quantity", value: amount.toString() },
    ],
  })

  console.log("onWithdrawId", messageId)

  const res = await result({
    message: messageId,
    process: ENV.VITE_AGENT_LOCKER_PROCESS,
  })

  if (res.Messages.length === 0 && res.Spawns.length === 0 && res.Output.data) {
    throw new Error(res.Output.data)
  }

  return messageId
}

export async function claimRewards(): Promise<string> {
  const messageId = await message({
    process: ENV.VITE_AGENT_LOCKER_PROCESS,
    signer: createDataItemSigner(window.arweaveWallet),
    tags: [{ name: "Action", value: "Claim-Rewards" }],
  })

  console.log("onClaimRewardsId", messageId)

  const res = await result({
    message: messageId,
    process: ENV.VITE_AGENT_LOCKER_PROCESS,
  })

  if (res.Messages.length === 0 && res.Spawns.length === 0 && res.Output.data) {
    throw new Error(res.Output.data)
  }

  return messageId
}
