import { Avatar } from "@mui/material"

import { useTokenInfo } from "@/hooks/use-token-info"

type TokenAvatarProps = {
  tokenId: string
  size?: "medium" | "large" | "xl"
}

const sizes = {
  medium: 16,
  large: 32,
  xl: 84,
}

export function TokenAvatar(props: TokenAvatarProps) {
  const { tokenId, size = "medium" } = props
  const [tokenInfo] = useTokenInfo(tokenId)

  return (
    <Avatar
      src={tokenInfo ? `https://arweave.net/${tokenInfo.logo}` : ""}
      alt={tokenInfo ? tokenInfo.name : tokenId}
      sx={{
        width: sizes[size],
        height: sizes[size],
        fontSize: sizes[size] * 0.75,
        display: "inline-flex",
      }}
    />
  )
}
