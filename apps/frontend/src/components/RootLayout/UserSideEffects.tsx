import { useActiveAddress } from "arweave-wallet-kit"
import { useEffect } from "react"

import { getUserSettings } from "../../api/user-settings-api"
import { $userSettings } from "../../stores/user-settings-store"

export function UserSideEffects() {
  const activeAddress = useActiveAddress()

  useEffect(() => {
    if (!activeAddress) {
      $userSettings.set(null)
      return
    }

    $userSettings.set(undefined)
    // Load user settings
    getUserSettings().then($userSettings.set)
  }, [activeAddress])

  return null
}
