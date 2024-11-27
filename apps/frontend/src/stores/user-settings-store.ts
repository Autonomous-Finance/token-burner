import { atom } from "nanostores"

import { UserSettings, persistToArweave } from "../api/user-settings-api"

export const $userSettings = atom<UserSettings | null | undefined>()

$userSettings.listen((newValue, oldValue) => {
  if (!newValue || !oldValue) return
  persistToArweave(newValue)
})
