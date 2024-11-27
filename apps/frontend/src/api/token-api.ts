import { Message } from "./ao"
import { dryrun } from "./ao-connection"
import { nativeTokenInfo } from "../utils/native-token"
import { isAddress } from "../utils/utils"
import { TOKEN_MIRRORS } from "@/settings"
import { getTagValue } from "@/utils/arweave"

export type TokenInfo = {
  id: string
  denomination: number
  ticker: string
  logo: string
  name: string
}

export type TokenHolder = {
  rank: number
  entityId: string
  balance: number
}

export async function getBalance(tokenId: string, address: string) {
  const res = await dryrun({
    Owner: address,
    process: TOKEN_MIRRORS[tokenId] || tokenId,
    tags: [
      { name: "Action", value: "Balance" },
      { name: "Recipient", value: address },
    ],
  })

  try {
    for (const msg of res.Messages as Message[]) {
      const balance = getTagValue("Balance", msg.Tags) || JSON.parse(msg.Data)

      if (balance) return BigInt(balance)
    }

    throw new Error(`Balance response malformed ${tokenId}`)
  } catch (err) {
    console.error(`Failed to read balance ${tokenId}`, err)
    throw err
  }
}

export async function getNativeArBalance(address: string) {
  const res = await fetch(`https://arweave.net/wallet/${address}/balance`)
  const balance = await res.text()

  return BigInt(balance)
}

type BalanceMap = {
  [key: string]: string | number
}

export async function getTokenHolders(tokenInfo: TokenInfo): Promise<TokenHolder[]> {
  const result = await dryrun({
    process: tokenInfo.id,
    data: "",
    tags: [{ name: "Action", value: "Balances" }],
  })

  try {
    if (result.Messages.length === 0)
      throw new Error(`No response from (get) Balances (${tokenInfo.name})`)
    const balanceMap = JSON.parse(result.Messages[0].Data) as BalanceMap
    const tokenHolders = Object.keys(balanceMap)
      .filter((entityId) => balanceMap[entityId] !== "0" && balanceMap[entityId] !== 0)
      .sort((a, b) => Number(balanceMap[b]) - Number(balanceMap[a]))
      .map((entityId, index) => ({
        rank: index + 1,
        entityId,
        balance: Number(balanceMap[entityId]) / 10 ** tokenInfo.denomination,
      }))

    return tokenHolders
  } catch (err) {
    console.error(err)
  }

  return []
}

type Tag = {
  name: string
  value: string
}

export async function getTokenInfo(tokenId: string): Promise<TokenInfo> {
  if (!isAddress(tokenId)) {
    throw new Error("Invalid tokenId")
  }
  if (nativeTokenInfo.id === tokenId) return nativeTokenInfo

  const result = await dryrun({
    process: tokenId,
    data: "",
    tags: [{ name: "Action", value: "Info" }],
  })

  if (result.Messages.length === 0) throw new Error(`No response from (get) Info (${tokenId})`)
  const tags = result.Messages[0].Tags as Tag[]
  const tagMap = tags.reduce(
    (acc, tag) => {
      acc[tag.name] = tag.value
      return acc
    },
    {} as { [key: string]: string },
  )

  const denomination = parseInt(tagMap["Denomination"])

  if (isNaN(denomination)) throw new Error("Denomination is not a number")

  return {
    id: tokenId,
    denomination,
    ticker: tagMap["Ticker"],
    logo: tagMap["Logo"],
    name: tagMap["Name"],
  }
}

/**
 * Only works for LPs
 */
export async function getTotalSupply(tokenId: string): Promise<string> {
  console.log("GET TOTAL SUPPLY", tokenId)
  const result = await dryrun({
    process: tokenId,
    tags: [{ name: "Action", value: "Total-Supply" }],
  })

  if (result.Messages.length === 0)
    throw new Error(`No response from (get) Total-Supply (${tokenId})`)
  const message = result.Messages[0]

  const tags = message.Tags as Tag[]
  const tag = tags.find((x) => x.name === "Total-Supply")
  const valueAsString = message.Data || tag?.value

  /*   let value = parseFloat(valueAsString ? valueAsString : "")

  if (isNaN(value)) throw new Error("Response malformed")
 */

  return valueAsString
}

export async function calcTotalSupply(tokenId: string): Promise<number> {
  const result = await dryrun({
    process: tokenId,
    tags: [{ name: "Action", value: "Balances" }],
  })

  try {
    if (result.Messages.length === 0)
      throw new Error(`No response from (get) Balances (${tokenId})`)
    const balanceMap = JSON.parse(result.Messages[0].Data) as BalanceMap
    const totalSupply = Object.values(balanceMap).reduce((acc: number, balance) => {
      return balance ? acc + Number(balance) : acc
    }, 0)

    return totalSupply
  } catch (err) {
    console.error(err)
  }

  return 0
}
