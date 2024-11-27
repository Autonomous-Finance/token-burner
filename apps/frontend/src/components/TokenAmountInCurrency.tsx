import { useStore } from "@nanostores/react"

import { TokenAmountBlock, TokenAmountBlockProps } from "./TokenAmountBlock"
import { UsdAmountBlock } from "./UsdAmountBlock"
import { $usdCurrency } from "../stores/currency-store"

export function TokenAmountInCurrency(props: TokenAmountBlockProps) {
  const { amount, tokenId, ...rest } = props

  const useCurrency = useStore($usdCurrency)

  if (useCurrency) {
    return (
      <UsdAmountBlock
        amount={amount}
        hideCopyToClipboard
        needsParsing
        tokenId={tokenId}
        {...rest}
      />
    )
  }

  return (
    <TokenAmountBlock
      amount={amount}
      tokenId={tokenId}
      showTicker
      hideCopyToClipboard
      needsParsing
      {...rest}
    />
  )
}
