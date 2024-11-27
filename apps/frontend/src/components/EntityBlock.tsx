import { AccountBox, East } from "@mui/icons-material"
import {
  Stack,
  Popover,
  Skeleton,
  Box,
  Typography,
  Link as MuiLink,
  Button,
  Grid,
} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import React, { useMemo, useState } from "react"

import { Link } from "react-router-dom"

import { AgentSvg } from "./AgentSvg"
import { IdBlock } from "./IdBlock"
import { TokenAmountBlock } from "./TokenAmountBlock"
import { TokenAmountInCurrency } from "./TokenAmountInCurrency"
import { getMessageById } from "@/api/messages-api"
import { getAllSwaps } from "@/api/swaps-api"
import { getBalance } from "@/api/token-api"
import { truncateId } from "@/utils/data-utils"

type EntityBlockProps = {
  entityId: string
  fullId?: boolean
  poolId: string
  quoteToken: string
  baseToken: string
}

export function EntityBlock(props: EntityBlockProps) {
  const { entityId, fullId, poolId, quoteToken, baseToken } = props

  const { data: message, isLoading } = useQuery({
    queryKey: ["message", entityId],
    queryFn: () => {
      if (!entityId) throw new Error("Invalid params")

      return getMessageById(entityId)
    },
    enabled: !!entityId,
  })

  const isAgent = message?.tags["Agent-Type"] && message?.tags["Agent-Factory"]

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const { data: swaps, isLoading: isSwapsLoading } = useQuery({
    queryKey: ["swaps", entityId, poolId],
    queryFn: async () => {
      if (!entityId) throw new Error("Invalid params")

      const data = await getAllSwaps(1000, undefined, undefined, undefined, poolId, [entityId])
      console.log("onTraderSwaps", data)
      return data
    },
    enabled: Boolean(entityId) && Boolean(anchorEl),
  })

  const stats = useMemo(() => {
    let buys = 0
    let sells = 0
    let volume = 0

    swaps?.forEach((swap) => {
      if (swap.fromToken === quoteToken) {
        buys += 1
      } else {
        sells += 1
      }

      volume += Number(swap.toQuantity)
    })

    return {
      buys,
      sells,
      volume,
    }
  }, [swaps])

  const { data: quoteTokenBalance, isLoading: isQuoteTokenBalanceLoading } = useQuery({
    queryKey: ["balance", entityId, quoteToken],
    queryFn: async () => {
      if (!entityId) throw new Error("Invalid params")
      const data = await getBalance(quoteToken, entityId)
      console.log("quoteTokenBalance", data)
      return data
    },
    enabled: Boolean(entityId) && Boolean(anchorEl),
  })

  const { data: baseTokenBalance, isLoading: isBaseTokenBalanceLoading } = useQuery({
    queryKey: ["balance", entityId, baseToken],
    queryFn: async () => {
      if (!entityId) throw new Error("Invalid params")
      const data = await getBalance(baseToken, entityId)
      console.log("baseTokenBalance", data)
      return data
    },
    enabled: Boolean(entityId) && Boolean(anchorEl),
  })

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          height: "100%",
          padding: (theme) => theme.spacing(0.75, 2),
          cursor: "pointer",
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          {isAgent && <AgentSvg height={22} width={22} />}
          {truncateId(entityId)}
        </Stack>
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Typography variant="body2" component="div">
          <Box
            component={motion.div}
            whileHover="hover"
            initial="rest"
            animate="rest"
            sx={{
              padding: 2,
              minWidth: 420,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack>
                  <Stack direction="row" gap={1} alignItems="center">
                    {isLoading ? (
                      <Skeleton variant="circular" width={22} height={22} />
                    ) : isAgent ? (
                      <AgentSvg height={22} width={22} />
                    ) : (
                      <AccountBox
                        sx={{
                          width: 22,
                          height: 22,
                        }}
                      />
                    )}
                    <IdBlock
                      label={truncateId(entityId)}
                      value={entityId}
                      href={`/entity/${entityId}`}
                    />
                  </Stack>
                  {message && isAgent && (
                    <Typography variant="caption" color="text.secondary">
                      owned by{" "}
                      <MuiLink
                        component={Link}
                        to={`/entity/${message.tags["Order-Owner"]}`}
                        color="secondary"
                        variant="caption"
                      >
                        {truncateId(message.tags["Order-Owner"])}
                      </MuiLink>
                    </Typography>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Button
                  sx={{
                    marginY: -1,
                    textTransform: "none",
                  }}
                  endIcon={<East />}
                  size="small"
                  component={Link}
                  to={`/entity/${entityId}`}
                >
                  View activity
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={2} marginTop={1}>
              <Grid item xs={6}>
                <Typography variant="caption" component="p">
                  <Typography variant="caption" color="text.secondary">
                    Buys
                  </Typography>{" "}
                  {isSwapsLoading ? (
                    <Skeleton width={80} sx={{ display: "inline-block" }} />
                  ) : (
                    stats.buys
                  )}
                </Typography>
                <Typography variant="caption" component="p">
                  <Typography variant="caption" color="text.secondary">
                    Sells
                  </Typography>{" "}
                  {isSwapsLoading ? (
                    <Skeleton width={80} sx={{ display: "inline-block" }} />
                  ) : (
                    stats.sells
                  )}
                </Typography>
                <Typography variant="caption" component="p">
                  <Typography variant="caption" color="text.secondary">
                    Volume
                  </Typography>{" "}
                  {isSwapsLoading ? (
                    <Skeleton width={80} sx={{ display: "inline-block" }} />
                  ) : (
                    <TokenAmountInCurrency amount={stats.volume} />
                  )}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Holdings
                </Typography>{" "}
                <Typography variant="caption" component="p">
                  {isBaseTokenBalanceLoading || typeof baseTokenBalance !== "number" ? (
                    <Skeleton width={80} sx={{ display: "inline-block" }} />
                  ) : (
                    <TokenAmountBlock
                      amount={baseTokenBalance}
                      needsParsing
                      tokenId={baseToken}
                      hideCopyToClipboard
                      showTicker
                    />
                  )}
                </Typography>
                <Typography variant="caption" component="p">
                  {isQuoteTokenBalanceLoading || typeof quoteTokenBalance !== "number" ? (
                    <Skeleton width={80} sx={{ display: "inline-block" }} />
                  ) : (
                    <TokenAmountBlock
                      amount={quoteTokenBalance}
                      needsParsing
                      tokenId={quoteToken}
                      hideCopyToClipboard
                      showTicker
                    />
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Typography>
      </Popover>
    </>
  )
}
