import { atom } from "nanostores"

import { PoolOverview } from "../api/monitor-api"
import { Pool } from "../api/pools-api"

export const $poolsOverviewMap = atom<Record<string, PoolOverview> | null>(null)
export const $allPools = atom<Pool[]>([])
