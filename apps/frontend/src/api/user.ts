import { useQuery } from "@tanstack/react-query"

import { useActiveAddress } from "arweave-wallet-kit"

import { W_AR } from "../settings"
import { TokenInfo } from "./token-api"

export async function getUserTokens(): Promise<TokenInfo[]> {
  console.log("userTokens - fetching")
  const result = (await (window.arweaveWallet as any).userTokens()) as {
    Denomination: number
    Logo: string
    Name: string
    Ticker: string
    processId: string
    // balance: string
  }[]

  // PATCH FOR AR to be displayed as wAR
  const patchedTokenTicker = (token: { processId: string; Ticker: string }) =>
    token.processId == W_AR.id ? W_AR.ticker : token.Ticker

  const userTokens = result.map((token) => ({
    id: token.processId,
    denomination: token.Denomination,
    ticker: patchedTokenTicker(token),
    logo: token.Logo,
    name: token.Name,
    // balance: BigInt(parseNumberAsBigInt(token.balance, token.Denomination)),
  }))

  console.log("userTokens", userTokens)
  return userTokens
}

export function useUserTokens(): TokenInfo[] | null | undefined {
  const activeAddr = useActiveAddress()

  const { data, isLoading } = useQuery({
    queryKey: ["user-tokens", activeAddr],
    queryFn: () => getUserTokens(),
  })

  if (!activeAddr) return []

  return isLoading ? null : data
}
