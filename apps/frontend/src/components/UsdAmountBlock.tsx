import { Skeleton, Tooltip, Typography } from "@mui/material"
import React from "react"

import { NumberFont } from "./RootLayout/fonts"
import { TokenAmountBlockProps } from "./TokenAmountBlock"
import { useTokenInfo } from "../hooks/useTokenInfo"
import { formatNumber } from "../utils/number-utils"

export function UsdAmountBlock(props: TokenAmountBlockProps) {
  const { amount, needsParsing, tokenId, quoteTokenUsdPrice } = props
  const tokenInfo = useTokenInfo(tokenId)

  if (quoteTokenUsdPrice === undefined)
    return <Skeleton component="span" sx={{ display: "inline-flex" }} width={80} />
  if (quoteTokenUsdPrice === null) return "-"

  let amountNumber = Number(amount) * quoteTokenUsdPrice
  const decimals = amountNumber !== 0 && tokenInfo ? tokenInfo.denomination : 0
  const usdDecimals = amountNumber !== 0 ? 2 : 0

  if (needsParsing) amountNumber = amountNumber / 10 ** decimals

  const longValue = formatNumber(amountNumber, {
    minimumFractionDigits: usdDecimals,
    maximumFractionDigits: 18,
  })

  const smallAmount = amountNumber < 1 && amountNumber > -1
  let firstNonZeroPos = longValue.indexOf(".") + 1
  let leadingZeroes = 0
  while (longValue[firstNonZeroPos] === "0") {
    firstNonZeroPos++
    leadingZeroes++
  }
  let maxDecimals = leadingZeroes + 4

  if (maxDecimals > 18) maxDecimals = 18
  if (maxDecimals < decimals) maxDecimals = decimals

  const shortValue = formatNumber(amountNumber, {
    minimumFractionDigits: usdDecimals,
    maximumFractionDigits: smallAmount ? maxDecimals : usdDecimals,
  })

  return (
    <Typography fontFamily={NumberFont} component="span" variant="inherit">
      <Tooltip
        title={
          <Typography fontFamily={NumberFont} component="span" variant="inherit">
            <span>{longValue} USD</span>
          </Typography>
        }
      >
        <span>${shortValue}</span>
      </Tooltip>
    </Typography>
  )
}
