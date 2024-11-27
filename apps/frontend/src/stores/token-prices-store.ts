import { atom } from "nanostores"

export const $tokenPrices = atom<Record<string, { price: number }> | undefined>()
