import { Paper, Stack } from "@mui/material"
import React from "react"
import { useParams } from "react-router-dom"

import { SectionInfo } from "../SectionInfo"
import { SimpleNumberFormat } from "../SimpleNumberFormat"
import useHopperPrice from "@/hooks/useHopper"
import useTokenDetails from "@/hooks/useTokenDetails"

export default function TokenStats() {
  const { tokenId } = useParams()
  const { data: token, isLoading } = useTokenDetails(tokenId ?? "")
  const { data: tokenPrice, isLoading: isTokenPriceLoading } = useHopperPrice(tokenId ?? "", "usd")

  if (isLoading || !token) {
    return <div>Loading...</div>
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <Stack gap={1}>
        <SectionInfo
          title="Total Supply"
          value={
            <SimpleNumberFormat
              amount={token.TotalSupply ?? 0}
              tokenId={tokenId}
              needsParsing
              currency={false}
            />
          }
        />
        <SectionInfo
          title="Current Price"
          value={<div>$ {isTokenPriceLoading || !tokenPrice ? "..." : tokenPrice.toFixed(4)}</div>}
        />
      </Stack>
    </Paper>
  )
}
