import { useColorScheme } from "@mui/material"
import { ArweaveWalletKit } from "arweave-wallet-kit"
import React from "react"

import { UserSideEffects } from "./UserSideEffects"
import { MainFontFF } from "./fonts"

export function ArweaveProvider({ children }: { children: React.ReactNode }) {
  const { mode = "dark" } = useColorScheme()

  return (
    <ArweaveWalletKit
      theme={{
        displayTheme: mode === "dark" ? "dark" : "light",
        font: {
          fontFamily: MainFontFF,
        },
        radius: "minimal",
        accent: {
          r: 76,
          g: 175,
          b: 81,
        },
      }}
      config={{
        appInfo: {
          name: "Token Burner",
        },
        permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "ACCESS_TOKENS"],
        ensurePermissions: true,
      }}
    >
      <UserSideEffects />
      {children}
    </ArweaveWalletKit>
  )
}
