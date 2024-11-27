import { CurrencyExchange } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import React from "react"

import { $usdCurrency } from "../stores/currency-store"

export function SwitchCurrencyButton() {
  return (
    <IconButton
      size="small"
      onClick={(event) => {
        event.stopPropagation()
        $usdCurrency.set(!$usdCurrency.get())
      }}
      color="secondary"
      sx={{
        marginY: -1,
        "&:hover": {
          color: "var(--mui-palette-accent-main)",
        },
      }}
    >
      <CurrencyExchange fontSize="inherit" />
    </IconButton>
  )
}
