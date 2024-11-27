import { Stack } from "@mui/material"
import { Box } from "@mui/system"
import React from "react"

type BuySellProportions = {
  buy: number
  sell: number
}

export function BuySellProportions(props: BuySellProportions) {
  const { buy, sell } = props

  const total = buy + sell
  const buyWidth = (buy / total) * 100
  const sellWidth = (sell / total) * 100

  return (
    <Stack direction="row" gap={0.5}>
      <Box
        sx={{
          borderRadius: 8,
          height: 4,
          width: `${buyWidth}%`,
          bgcolor: "green",
        }}
      />
      <Box
        sx={{
          borderRadius: 8,
          height: 4,
          width: `${sellWidth}%`,
          bgcolor: "red",
        }}
      />
    </Stack>
  )
}
