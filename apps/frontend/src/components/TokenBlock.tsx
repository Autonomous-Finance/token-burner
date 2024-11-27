import { Avatar, Stack } from "@mui/material"
import React from "react"

import { IdBlock } from "./IdBlock"
import { useTokenInfo } from "../hooks/useTokenInfo"
import { truncateId } from "../utils/data-utils"

type TokenBlockProps = {
  tokenId: string
  hideCopyToClipboard?: boolean
}

export function TokenBlock(props: TokenBlockProps) {
  const { tokenId, hideCopyToClipboard } = props

  const tokenInfo = useTokenInfo(tokenId)

  return (
    <>
      <Stack direction="row" gap={1} alignItems="center">
        {tokenInfo && (
          <Avatar
            src={`https://arweave.net/${tokenInfo.logo}`}
            alt={tokenInfo.name}
            sx={{
              width: 16,
              height: 16,
            }}
          />
        )}
        <IdBlock
          label={tokenInfo?.ticker || truncateId(tokenId)}
          value={tokenId}
          href={`https://ao.link/#/token/${tokenId}`}
          hideCopyToClipboard={hideCopyToClipboard}
        />
      </Stack>
    </>
  )
}
