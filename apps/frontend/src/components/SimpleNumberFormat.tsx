import { Skeleton } from "@mui/material"
import Tooltip from "@mui/material/Tooltip/Tooltip"
import Typography from "@mui/material/Typography/Typography"
import { useStore } from "@nanostores/react"

import { NumberFont } from "./RootLayout/fonts"
import type { TokenAmountBlockProps } from "./TokenAmountBlock"
import { useTokenInfo } from "../hooks/useTokenInfo"
import { $arPrice, $usdCurrency } from "../stores/currency-store"
import { formatUnits } from "../utils/math"
import { nativeTokenInfo } from "../utils/native-token"
import { formatNumberWithNumbro } from "../utils/number-utils"

export function SimpleNumberFormat({
  amount,
  tokenId,
  needsParsing,
  showTicker = true,
  currency = true,
  quoteTokenUsdPrice,
  mantissa = 0,
  totalLength = 0,
  tooltipValue,
}: TokenAmountBlockProps & {
  currency?: boolean
  mantissa?: number
  totalLength?: number
  tooltipValue?: string
}) {
  const arPrice = useStore($arPrice)
  const tokenInfo = useTokenInfo(tokenId || nativeTokenInfo.id)
  const useCurrency = useStore($usdCurrency)

  const standardizedAmount = needsParsing
    ? Number(amount) / 10 ** (tokenInfo?.denomination || 18)
    : Number(amount)
  const parsedValue = needsParsing
    ? formatUnits(BigInt(amount), tokenInfo?.denomination || 18)
    : amount

  const toolTipText = tooltipValue || standardizedAmount

  let currencyValue = parsedValue
  const collateralPrice = quoteTokenUsdPrice || arPrice

  if (currency && useCurrency) {
    if (collateralPrice === undefined)
      return <Skeleton component="span" sx={{ display: "inline-flex" }} width={80} />
    if (collateralPrice === null) return "-"

    currencyValue = currency && useCurrency ? standardizedAmount * collateralPrice : parsedValue
  }

  return (
    <Typography fontFamily={NumberFont} component="span" variant="inherit">
      <Tooltip
        title={
          <Typography fontFamily={NumberFont} component="span" variant="inherit">
            <span>
              {formatNumberWithNumbro(toolTipText)} {tokenInfo?.ticker}
            </span>
          </Typography>
        }
      >
        <span>
          {currency && useCurrency
            ? `$ ${formatNumberWithNumbro(Number(currencyValue), mantissa, totalLength)}`
            : `${formatNumberWithNumbro(Number(parsedValue))} ${showTicker ? tokenInfo?.ticker : ""}`}
        </span>
      </Tooltip>
    </Typography>
  )
}
