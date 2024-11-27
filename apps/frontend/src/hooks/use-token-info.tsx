import { useStore } from "@nanostores/react"
import { useEffect, useMemo } from "react"

import { $tokenInfoCache } from "../stores/token-info-store"
import { getTokenInfo, TokenInfo } from "@/api/token-api"
import { AO, L1_AR } from "@/settings"

const PRE_CACHED_TOKENS: Record<string, TokenInfo> = {
  [L1_AR]: {
    id: L1_AR,
    denomination: 12,
    ticker: "AR",
    logo: "MfjfWFDOi_3CKO5fW4zUo-B4LibH_IXU8gye941oNq0",
    name: "AR",
  },
  [AO]: {
    id: AO,
    denomination: 12,
    ticker: "AO",
    logo: "UkS-mdoiG8hcAClhKK8ch4ZhEzla0mCPDOix9hpdSFE",
    name: "AO",
  },
}

export function useTokenInfo(tokenId = ""): [TokenInfo | undefined, boolean] {
  const tokenIds = useMemo(() => [tokenId], [tokenId])
  const [tokens, loading] = useTokenInfos(tokenIds)
  return [tokens?.[0], loading]
}

export function useTokenInfos(tokenIds: string[]): [TokenInfo[] | undefined, boolean] {
  const cacheMap = useStore($tokenInfoCache, {
    keys: tokenIds,
  })

  const tokenInfos: TokenInfo[] = useMemo(() => {
    return tokenIds
      .map((tokenId) => {
        if (tokenId in PRE_CACHED_TOKENS) {
          return PRE_CACHED_TOKENS[tokenId]
        }
        const cachedValue = cacheMap ? cacheMap[tokenId] : undefined
        const isFetched = cachedValue !== undefined
        const isValid = cachedValue !== "loading" && cachedValue !== "error"
        return isFetched && isValid ? JSON.parse(cachedValue) : undefined
      })
      .filter((info) => info !== undefined) as TokenInfo[]
  }, [cacheMap, tokenIds])

  const isLoading = useMemo(() => {
    return tokenIds.some((tokenId) => {
      const cachedValue = cacheMap ? cacheMap[tokenId] : undefined
      return cachedValue === "loading"
    })
  }, [cacheMap, tokenIds])

  // TODO
  // const isLoading = useMemo(() => {
  //   return tokenIds.length !== tokenInfos.length
  // }, [cacheMap, tokenIds])

  useEffect(() => {
    const cacheMap = $tokenInfoCache.get()
    tokenIds.forEach((tokenId) => {
      const cachedValue = cacheMap ? cacheMap[tokenId] : undefined
      const isFetched = cachedValue !== undefined
      const isLoading = cachedValue === "loading"

      if (isFetched || isLoading || tokenId in PRE_CACHED_TOKENS || !tokenId) return

      $tokenInfoCache.setKey(tokenId, "loading")
      getTokenInfo(tokenId)
        .then((tokenInfo) => {
          $tokenInfoCache.setKey(tokenId, JSON.stringify(tokenInfo))
        })
        .catch((error) => {
          console.error(error)
          $tokenInfoCache.setKey(tokenId, "error")
        })
    })
  }, [tokenIds])

  return [tokenInfos, isLoading]
}
