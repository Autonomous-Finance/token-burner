import { useStore } from "@nanostores/react"
import { dryrun } from "@permaweb/aoconnect"
import { useEffect, useMemo, useState } from "react"

import { DEXI_MONITOR_CONTRACT } from "./monitor-api"
import { getNativeArPrice } from "./price-oracle-api"
import { getBalance, getNativeArBalance, TokenInfo } from "./token-api"
import { useTokenInfos } from "@/hooks/use-token-info"
import { AO, L1_AR } from "@/settings"
import { $allPools } from "@/stores/pools-store"
import { $tokenPrices } from "@/stores/token-prices-store"
import { parseBigIntAsNumber } from "@/utils/format"

export interface RichTokenInfo extends TokenInfo {
  id: string
  balance: bigint
  value?: number
  price?: number
  hasPool?: boolean
}

export function usePortfolio(entityId: string): [RichTokenInfo[] | null] {
  const pools = useStore($allPools)
  const loadingPools = pools.length === 0

  const tokenIds = useMemo<string[]>(() => {
    const set = new Set<string>()

    set.add(L1_AR)
    set.add(AO)

    for (const pool of pools) {
      set.add(pool.baseToken)
      set.add(pool.quoteToken)
    }

    return Array.from(set)
  }, [pools])

  // tokens
  const [tokens, loadingTokenInfos] = useTokenInfos(tokenIds)

  // fetch balances
  const [loadingBalances, setLoadingBalances] = useState(true)
  const [balances, setBalances] = useState<Record<string, bigint>>({})

  // fetch prices
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [prices, setPrices] = useState<Record<string, { price: number }>>({})

  // tokens with balances & prices
  const richTokens = useMemo(() => {
    if (!tokens) return null

    const list = tokens.map((token) => {
      const balance = balances[token.id]
      const price = prices[token.id]?.price
      const hasPool = token.id in prices
      const value =
        (price || 0) * Number(parseBigIntAsNumber(balance, token.denomination, token.denomination))

      return {
        ...token,
        balance,
        price,
        value,
        hasPool,
      }
    })

    // sort by value, otherwise sort by price
    return list.sort((a, b) => {
      if (a.value && !b.value) return -1
      if (!a.value && b.value) return 1
      if (a.value && b.value) return a.value > b.value ? -1 : 1

      return a.price > b.price ? -1 : 1
    })
  }, [tokens, balances, prices, entityId])

  // manage loading state
  const loading = useMemo(
    () =>
      !!loadingPools ||
      !!loadingTokenInfos ||
      !!loadingPrices ||
      (!!loadingBalances && Object.keys(balances).length === 0),
    [loadingPools, loadingTokenInfos, loadingBalances, balances, loadingPrices],
  )

  // fetch balances
  useEffect(() => {
    ;(async () => {
      if (tokenIds.length === 0 || loadingPools || !entityId) {
        setLoadingBalances(false)
        setBalances({})
        return
      }
      setBalances({})
      setLoadingBalances(true)

      try {
        await Promise.all([
          tokenIds.forEach(async (id) => {
            const balance =
              id === L1_AR ? await getNativeArBalance(entityId) : await getBalance(id, entityId)

            setBalances((prev) => ({
              ...prev,
              [id]: balance,
            }))
          }),
        ])
        setLoadingBalances(false)
      } catch (error) {
        console.error("Failed to fetch prices", error)
        setLoadingBalances(false)
      }
    })()
  }, [entityId, tokenIds, loadingPools])

  // fetch prices for all tokens (user tokens included)
  useEffect(() => {
    ;(async () => {
      if (tokenIds === null || tokenIds.length === 0 || loadingPools) {
        // setLoadingPrices(false)
        // setPrices({})
        return
      }
      setLoadingPrices(true)

      try {
        const res = await dryrun({
          process: DEXI_MONITOR_CONTRACT,
          tags: [
            { name: "Action", value: "Get-Price-For-Tokens" },
            { name: "Tokens", value: JSON.stringify(tokenIds) },
          ],
        })
        const prices = res.Messages[0].Tags.find((x: any) => x.name === "Prices")?.value
        const arPrice = await getNativeArPrice()
        prices[L1_AR] = { price: arPrice }
        console.log("onTokenPrices", prices)
        setPrices(prices)
        $tokenPrices.set(prices)
        setTimeout(() => {
          setLoadingPrices(false)
        }, 200)
      } catch (error) {
        console.error("Failed to fetch prices", error)
        setLoadingPrices(false)
      }
    })()
  }, [tokenIds, loadingPools, entityId])

  return [loading ? null : richTokens]
}
