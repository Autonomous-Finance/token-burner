import { Box } from "@mui/material"
import React from "react"

type PercentChangeProps = {
  previousPrice: number
  latestPrice: number
}

export function PercentChange(props: PercentChangeProps) {
  const { previousPrice, latestPrice } = props

  const percentChange =
    previousPrice === 0 || latestPrice === 0
      ? 0
      : ((latestPrice - previousPrice) / previousPrice) * 100

  return (
    <>
      <Box
        component="span"
        sx={{
          color: percentChange > 0 ? "green" : percentChange < 0 ? "red" : undefined,
        }}
      >
        {percentChange.toFixed(2).replace("0.00", "0")}%
      </Box>
    </>
  )
}
