import { persistentAtom } from "@nanostores/persistent"
import { atom } from "nanostores"

export const $usdCurrency = persistentAtom<boolean>("dexi-usd-currency", true, {
  decode: (value) => value === "true",
  encode: (value) => value.toString(),
})
export const $arPrice = atom<number | null | undefined>(undefined)
