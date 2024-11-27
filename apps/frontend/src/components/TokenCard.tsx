import { Public, Telegram, Verified, X } from "@mui/icons-material"
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material"

import { Link } from "react-router-dom"

import TokenCover from "./TokenCover"
import type { TokenDetails } from "../api/tokendrop-api"
import useTokenDetails from "../hooks/useTokenDetails"

export default function TokenCard({
  poolId,
  token,
  tokenInfoMock,
  hideCTA = false,
}: {
  poolId?: string
  token: string
  tokenInfoMock?: TokenDetails
  hideCTA?: boolean
}) {
  const theme = useTheme()
  let tokenInfo = tokenInfoMock
  const { isLoading, data: tokenDetails } = useTokenDetails(token)

  if (!tokenInfoMock) {
    tokenInfo = tokenDetails
  }

  const socials = Array.isArray(tokenInfo?.SocialLinks)
    ? tokenInfo?.SocialLinks
    : Object.entries(tokenInfo?.SocialLinks ?? {}).map(([key, value]) => ({
        key,
        value,
      }))

  const twitter = socials.find((link) => link.key === "Twitter")
  const telegram = socials.find((link) => link.key === "Telegram")
  const website = socials.find((link) => link.key === "Website")

  const others = socials.filter(
    (link) => link.key !== "Twitter" && link.key !== "Telegram" && link.key !== "Website",
  )

  if (isLoading || !tokenInfo) {
    return (
      <Stack>
        <Paper
          sx={{
            minHeight: 350,
            border: "1px solid",
            borderColor: theme.palette.grey[700],
            position: "relative",
            borderRadius: 1,
          }}
        >
          <Box sx={{ width: "100%", height: 112 }} />
          <Stack
            gap={2}
            sx={{
              padding: 2,
              marginTop: "-4rem",
            }}
            alignItems="center"
          >
            <Skeleton variant="circular" width={80} height={80} />
            <Skeleton variant="text" width={100} />
            <Stack
              direction="row"
              gap={2}
              alignItems="center"
              justifyContent="center"
              flexWrap="wrap"
            >
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="circular" width={24} height={24} />
            </Stack>
            <Skeleton variant="text" width={200} />
          </Stack>
        </Paper>
      </Stack>
    )
  }

  return (
    <Stack>
      <Paper
        sx={{
          minHeight: 220,
          // border: "1px solid",
          // borderColor: theme.palette.grey[900],
          position: "relative",
          borderRadius: 1,
        }}
      >
        <TokenCover imageSource={tokenInfo.CoverImage} />
        <Stack
          gap={2}
          sx={{
            padding: 2,
            marginTop: "-4rem",
          }}
          alignItems="center"
        >
          <Avatar
            src={tokenInfo ? `https://arweave.net/${tokenInfo.Logo}` : ""}
            alt={tokenInfo ? tokenInfo.Name : token}
            sx={{ width: 64, height: 64 }}
          />
          <Stack direction="row" gap={1} alignItems="center">
            {tokenInfo.RenounceOwnership ? (
              <Tooltip title="By renouncing ownership, you make the core aspects of the token, like total supply and ownership, permanently fixed, which increases trust.">
                <Verified color="success" />
              </Tooltip>
            ) : (
              <Tooltip title="By renouncing ownership, you make the core aspects of the token, like total supply and ownership, permanently fixed, which increases trust.">
                <Verified />
              </Tooltip>
            )}
            <Typography variant="h5" component="span">
              {tokenInfo.Name}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
          >
            {twitter?.value ? (
              <Chip
                label={"X"}
                icon={<X sx={{ height: 16 }} />}
                component="a"
                href={twitter?.value}
                clickable
                target="_blank"
              />
            ) : null}
            {telegram?.value ? (
              <Chip
                label={"Telegram"}
                icon={<Telegram sx={{ height: 16 }} />}
                component="a"
                href={telegram?.value}
                clickable
                target="_blank"
              />
            ) : null}
            {website?.value ? (
              <Chip
                label={"Website"}
                icon={<Public sx={{ height: 16 }} />}
                component="a"
                href={website?.value}
                clickable
                target="_blank"
              />
            ) : null}
            {others.length
              ? others
                  .filter((link) => link.value)
                  .map((link) => {
                    return (
                      <Chip
                        key={link.key}
                        label={link.key}
                        icon={<Public sx={{ height: 16 }} />}
                        component="a"
                        href={link.value}
                        clickable
                        target="_blank"
                      />
                    )
                  })
              : null}
          </Stack>
          <Typography variant="caption" component="span">
            {tokenInfo.Description}
          </Typography>
        </Stack>
        {/* Manage this token box */}
        {!hideCTA && (
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="center"
            sx={{
              padding: 2,
              fontSize: "14px",
              backgroundColor: theme.palette.background.paper,
              borderTop: "1px dashed",
              borderColor: theme.palette.grey[800],
            }}
          >
            <Link to={`/token/${token}`}>View token profile</Link>
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}
