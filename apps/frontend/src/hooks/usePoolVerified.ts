import { useStore } from "@nanostores/react"
import { useEffect, useMemo } from "react"

import type { Pool } from "../api/pools-api"
import { getTokenDetails } from "../api/tokendrop-api"
import { $poolVerifyCache } from "../stores/pool-verify-store"
import { nativeTokenInfo } from "../utils/native-token"
import { VERIFIED_TOKENS } from "../verified_tokens"

export type PoolVerifyInfo = {
  baseTokenRenounced: boolean
  quoteTokenRenounced: boolean
  verified: boolean
}

export function usePoolVerified(pool: Pool) {
  const cacheMap = useStore($poolVerifyCache, {
    keys: [pool.id],
  })

  const cachedValue = cacheMap ? cacheMap[pool.id] : undefined
  const isFetched = cachedValue !== undefined
  const isValid = cachedValue !== "loading" && cachedValue !== "error"

  const poolInfo: PoolVerifyInfo | undefined = useMemo(
    () => (isFetched && isValid ? JSON.parse(cachedValue) : undefined),
    [cachedValue, isFetched, isValid],
  )

  useEffect(() => {
    let isSubscribed = true

    const fetchData = async (pool: Pool) => {
      if (!isSubscribed) return

      const baseTokenVerified = VERIFIED_TOKENS.includes(pool.baseToken)
        ? true
        : (await getTokenDetails(pool.baseToken)).RenounceOwnership || false

      const quoteTokenVerified = VERIFIED_TOKENS.includes(pool.quoteToken)
        ? true
        : (await getTokenDetails(pool.quoteToken)).RenounceOwnership || false

      $poolVerifyCache.setKey(
        pool.id,
        JSON.stringify({
          baseTokenVerified,
          quoteTokenVerified,
          verified: baseTokenVerified && quoteTokenVerified,
        }),
      )
    }

    if (
      isFetched ||
      $poolVerifyCache.get()[pool.id] === "loading" ||
      pool.id === nativeTokenInfo.id
    )
      return

    $poolVerifyCache.setKey(pool.id, "loading")

    fetchData(pool).catch((error) => {
      if (isSubscribed) $poolVerifyCache.setKey(pool.id, "error")
      console.error(error)
    })

    return () => {
      isSubscribed = false
    }
  }, [isFetched, pool])

  return poolInfo
}
