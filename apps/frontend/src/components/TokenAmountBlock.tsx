import { Box, Skeleton, Tooltip, Typography, TypographyProps } from "@mui/material"
import React from "react"

import { CopyToClipboard } from "./CopyToClipboard"
import { NumberFont } from "./RootLayout/fonts"
import { formatNumber } from "../utils/number-utils"
import { useTokenInfo } from "@/hooks/use-token-info"
import { formatNumberAuto, formatTicker } from "@/utils/format"

export type TokenAmountBlockProps = {
  amount: string | number | bigint
  needsParsing?: boolean
  tokenId?: string
  hideCopyToClipboard?: boolean
  showTicker?: boolean
  quoteTokenUsdPrice?: number
} & TypographyProps

export function TokenAmountBlock(props: TokenAmountBlockProps) {
  const { amount, tokenId, needsParsing, hideCopyToClipboard, showTicker, ...rest } = props

  const [tokenInfo] = useTokenInfo(tokenId)

  let amountNumber = Number(amount)
  const decimals = amountNumber !== 0 && tokenInfo ? tokenInfo.denomination : 0

  if (needsParsing) amountNumber = amountNumber / 10 ** decimals

  const longValue = formatNumber(amountNumber, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  if (!tokenInfo) return <Skeleton width={60} sx={{ display: "inline-block" }} />

  return (
    <Typography fontFamily={NumberFont} component="span" variant="inherit" {...rest}>
      <Box
        sx={{
          fill: "none",
          "&:hover": { fill: "var(--mui-palette-text-secondary)" },
        }}
        component="span"
      >
        <Tooltip
          title={
            amount === "n/A" ? null : (
              <Typography fontFamily={NumberFont} component="span" variant="inherit">
                <span>
                  {longValue} {showTicker ? formatTicker(tokenInfo?.ticker) : ""}
                </span>
              </Typography>
            )
          }
        >
          <span>
            {amount === "n/A" ? "N/A" : formatNumberAuto(amountNumber)}{" "}
            {showTicker ? formatTicker(tokenInfo?.ticker) : ""}
          </span>
        </Tooltip>
        {!hideCopyToClipboard && <CopyToClipboard value={String(amount)} />}
      </Box>
    </Typography>
  )
}
