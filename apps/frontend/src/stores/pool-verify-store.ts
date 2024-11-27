import { persistentAtom, persistentMap } from "@nanostores/persistent"

export const $verifyRefresh = persistentAtom<string>("pool-verify-refresh", "0")

export const $poolVerifyCache = persistentMap<Record<string, string | undefined>>(
  "pool-verify-cache",
  {},
)

// cleanup cache stuck in "loading" state
const cache = $poolVerifyCache.get()
for (const poolId in cache) {
  if (cache[poolId] === "loading" || cache[poolId] === "error") {
    $poolVerifyCache.setKey(poolId, undefined)
  }
}

const refresh = $verifyRefresh.get()
const delta = new Date().getTime() - Number.parseInt(refresh)
const oneWeek = 604800000

if (refresh === "0" || delta > oneWeek) {
  console.log("Resetting pool verify cache.")

  for (const poolId in cache) {
    $poolVerifyCache.setKey(poolId, undefined)
  }
  $verifyRefresh.set(new Date().getTime().toString())
}
