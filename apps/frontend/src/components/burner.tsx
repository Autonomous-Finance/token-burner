import {
  Autocomplete,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { dryrun } from "@permaweb/aoconnect"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useActiveAddress, useConnection } from "arweave-wallet-kit"
import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"

import { IdBlock } from "./IdBlock"
import { LoadingSkeletons } from "./LoadingSkeletons"
import { TokenAvatar } from "./TokenAvatar"
import TOKENBURNER from "../constants/TokenBurner_process"
import { useTokenInfo } from "../hooks/use-token-info"
import { getBalance } from "@/api/token-api"
import {
  burnTokens,
  getAllBurns,
  getBurnedLpTokens,
  getBurnEvents,
  getBurnStats as getBurnStats,
} from "@/api/token-burner-api"
import { useUserTokens } from "@/api/user"
import { CustomSlider } from "@/components/CustomSlider"
import { INPUT_DECIMALS } from "@/settings"
import { AoMessage } from "@/types"
import { flattenTags } from "@/utils/arweave"
import { truncateId } from "@/utils/data-utils"
import {
  formatNumberAuto,
  formatTicker,
  parseBigIntAsNumber,
  parseNumberAsBigInt,
} from "@/utils/format"

const latestBurnsPageSize = 20

export default function TokenBurner() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tokenId = searchParams.get("tokenId") || ""

  const [burnAmount, setBurnAmount] = useState("")

  const activeAddr = useActiveAddress()

  const [tokenInfo, tokenLoading] = useTokenInfo(tokenId)

  const {
    data: burnerInfo,
    error: infoError,
    isLoading: infoLoading,
    isFetching: infoFetching,
  } = useQuery({
    queryKey: ["burnerInfo"],
    queryFn: async () => {
      const result = await getBurnStats(TOKENBURNER)
      console.log("onBurnStats", result)
      return result
    },
  })

  const {
    data: burnedBalance,
    error: burnedBalanceError,
    isLoading: burnedBalanceLoading,
    isFetching: burnedBalanceFetching,
    refetch: refetchBurnedBalance,
  } = useQuery({
    queryKey: ["burnedBalance", tokenId, activeAddr],
    enabled: !!(tokenId && activeAddr),
    queryFn: async () => {
      if (!activeAddr) {
        throw new Error("Wallet not connected")
      }

      if (!tokenId) {
        throw new Error("Token ID is required")
      }
      const dryrunResult = await dryrun({
        process: TOKENBURNER,
        tags: [
          {
            name: "Action",
            value: "Burned-Balance",
          },
          {
            name: "Token",
            value: tokenId,
          },
          {
            name: "Recipient",
            value: activeAddr,
          },
        ],
      })

      const tags = flattenTags(dryrunResult.Messages[0].Tags)
      return tags["Quantity"]
    },
  })

  const {
    data: burnEventsData,
    error: burnEventsError,
    isLoading: burnEventsLoading,
    isFetching: burnEventsFetching,
    refetch: refetchBurnEvents,
  } = useQuery({
    queryKey: ["BurnEvents", tokenId],
    queryFn: async () => {
      const result = await getBurnEvents(TOKENBURNER, tokenId)
      console.log("onBurnEvents", result)
      if (result) return result.reverse().slice(0, 5)
      return result
    },
  })

  const { data: tokenBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ["tokenBalance", activeAddr, tokenId],
    enabled: !!activeAddr && !!tokenId,
    queryFn: async () => {
      if (!activeAddr || !tokenId) return "0"
      const balance = await getBalance(tokenId, activeAddr)
      return balance.toString()
    },
  })

  const amountAsBalancePercentage = useMemo(() => {
    if (!tokenBalance || !burnAmount) return 0

    const valueNormalized = parseNumberAsBigInt(burnAmount, tokenInfo?.denomination)
    const percentage = (valueNormalized * 100n) / BigInt(tokenBalance)

    return parseInt(percentage.toString())
  }, [tokenBalance, burnAmount, tokenInfo])

  // Mutation to burn tokens
  const burnTokensMutation = useMutation({
    mutationKey: ["BurnTokens", activeAddr],
    mutationFn: async () => {
      if (!activeAddr || !burnAmount || !tokenId || !tokenInfo) {
        throw new Error("Params invalid")
      }

      const messageId = await burnTokens({
        tokenProcess: tokenId,
        burnProcess: TOKENBURNER,
        amount: parseNumberAsBigInt(burnAmount, tokenInfo.denomination).toString(),
      })

      return messageId
    },
    onSuccess: () => {
      refetchBurnedBalance()
      refetchBurnEvents()
    },
  })

  const {
    data: lpTokensData,
    error: lpTokensError,
    isLoading: lpTokensLoading,
    isFetching: lpTokensFetching,
    refetch: refetchLPTokens,
  } = useQuery({
    queryKey: ["LPTokens", tokenId],
    queryFn: async () => {
      const result = await getBurnedLpTokens(TOKENBURNER, tokenId)
      console.log("onLpTokens", result)
      return result
    },
  })

  const { connect } = useConnection()

  // arconnect tokens with balances
  const tokens = useUserTokens()

  const [cursor, setCursor] = useState<string | undefined>()
  const [latestBurnsLoading, setLatestBurnsLoading] = useState(true)
  const [latestBurns, setLatestBurns] = useState<AoMessage[]>([])
  const [endReached, setEndReached] = useState(false)

  useEffect(() => {
    getAllBurns(latestBurnsPageSize).then((result) => {
      setLatestBurns(result)
      setLatestBurnsLoading(false)
      setCursor(result[result.length - 1]?.cursor)
    })
  }, [])

  if (infoError) {
    return <div>Error: {infoError.message}</div>
  }

  return (
    <Typography alignItems="center" gap={6} component={Stack} variant="caption">
      <Autocomplete
        freeSolo
        sx={{ width: 480 }}
        size="small"
        options={tokens || []}
        getOptionLabel={(option) => (typeof option === "string" ? option : option.id)}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <RenderedOption tokenId={option.id} />
          </li>
        )}
        filterOptions={(options, params) => {
          const filtered = options.filter(
            (option) =>
              (option.id && option.id.toLowerCase().includes(params.inputValue.toLowerCase())) ||
              (option.ticker &&
                option.ticker.toLowerCase().includes(params.inputValue.toLowerCase())),
          )

          return filtered
        }}
        value={tokens?.find((token) => token.id === tokenId) || null}
        onInputChange={(event, newInputValue) => {
          const tokenId = newInputValue
          if (tokenId.length !== 43 && tokenId.length !== 0) return
          console.log("onTokenChange", tokenId)
          if (!tokenId) searchParams.delete("tokenId")
          else searchParams.set("tokenId", tokenId)
          setSearchParams(searchParams, { replace: true })
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            margin="dense"
            label="Search"
            placeholder="Token Address"
            disabled={burnTokensMutation.isPending}
            type="text"
          />
        )}
      />

      {tokenId && (
        <>
          {tokenInfo ? (
            <Stack direction="row" gap={1}>
              <TokenAvatar tokenId={tokenId} size="large" />
              <Typography variant="subtitle1" color="primary">
                {formatTicker(tokenInfo.ticker)}
              </Typography>
            </Stack>
          ) : tokenLoading ? (
            <Skeleton width={100} height={35} />
          ) : (
            "Token not found"
          )}
        </>
      )}

      {tokenInfo ? (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ padding: 2 }} component={Stack} gap={2}>
              <div>
                <Typography variant="subtitle1" color="primary">
                  Overview
                </Typography>
                {infoLoading || infoFetching ? (
                  <Skeleton width={100} height={35} />
                ) : burnerInfo ? (
                  <Stack>
                    <div>
                      Total Burn Events:{" "}
                      {burnerInfo.perTokenStats &&
                      burnerInfo.perTokenStats[tokenId] &&
                      burnerInfo.perTokenStats[tokenId].numBurns
                        ? burnerInfo.perTokenStats[tokenId].numBurns
                        : 0}
                    </div>
                    <div>
                      Total Burned:{" "}
                      {burnerInfo.perTokenStats &&
                      burnerInfo.perTokenStats[tokenId] &&
                      burnerInfo.perTokenStats[tokenId].totalBurned
                        ? parseBigIntAsNumber(
                            burnerInfo.perTokenStats[tokenId].totalBurned,
                            tokenInfo?.denomination,
                          )
                        : "0"}{" "}
                      {formatTicker(tokenInfo?.ticker)}
                    </div>
                  </Stack>
                ) : (
                  "No data available"
                )}
              </div>

              <div>
                <Typography variant="subtitle1" color="primary">
                  Latest burns
                </Typography>
                {burnEventsLoading || burnEventsFetching ? (
                  <Skeleton width={100} height={35} />
                ) : burnEventsError ? (
                  <p>Error: {burnEventsError.message}</p>
                ) : burnEventsData ? (
                  <div>
                    {burnEventsData.length > 0 ? (
                      <Stack gap={0.5}>
                        {burnEventsData.map((event, index) => (
                          <Stack key={index} direction="row" gap={1} alignItems="center">
                            🔥
                            {formatNumberAuto(
                              parseBigIntAsNumber(event.amount, tokenInfo?.denomination),
                            )}{" "}
                            {formatTicker(tokenInfo?.ticker)} by
                            <IdBlock label={truncateId(event.user)} value={event.user} />
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <p>No burn events found.</p>
                    )}
                  </div>
                ) : null}
              </div>

              <Stack>
                <Typography variant="subtitle1" color="primary">
                  Liquidity Pools containing this token
                </Typography>
                {lpTokensLoading || lpTokensFetching ? (
                  <Skeleton width={100} height={35} />
                ) : lpTokensError ? (
                  <p>Error: {lpTokensError.message}</p>
                ) : lpTokensData ? (
                  <div>
                    {lpTokensData.length > 0 ? (
                      <Stack>
                        {lpTokensData.map((data, index) => (
                          <div key={index} style={{ textAlign: "left" }}>
                            <Stack direction="row" gap={1} alignItems="center">
                              <TokenAvatar tokenId={data.LpToken} />
                              <IdBlock
                                label={formatTicker(data.Details.Ticker)}
                                value={data.LpToken}
                                href={`https://dexi.arweave.net/#/pool/${data.LpToken}`}
                                hideCopyToClipboard
                              />
                              <IdBlock label={truncateId(data.LpToken)} value={data.LpToken} />
                            </Stack>
                          </div>
                        ))}
                      </Stack>
                    ) : (
                      <p>No burned LP tokens found.</p>
                    )}
                  </div>
                ) : null}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ padding: 2, width: 444 }}>
              <Typography variant="subtitle1" color="primary">
                Burn Tokens
              </Typography>
              <Stack direction="row" gap={1} alignItems="center">
                <TextField
                  fullWidth
                  size="small"
                  margin="dense"
                  label="Burn amount"
                  disabled={burnTokensMutation.isPending}
                  type="number"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {formatTicker(tokenInfo?.ticker)}
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  color={"accent" as any}
                  variant="outlined"
                  onClick={() => {
                    if (activeAddr) {
                      burnTokensMutation.mutate()
                    } else {
                      connect()
                    }
                  }}
                  sx={{ width: 110, height: 40, marginBottom: "-4px" }}
                >
                  Burn 🔥
                </Button>
              </Stack>
              {activeAddr && (
                <Stack paddingX={0.5}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component={Stack}
                    direction="row"
                    gap={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <span>Balance</span>
                    <span>
                      {balanceLoading ? (
                        <Skeleton width={60} sx={{ display: "inline-block" }} />
                      ) : (
                        formatNumberAuto(parseBigIntAsNumber(tokenBalance, tokenInfo?.denomination))
                      )}{" "}
                      {formatTicker(tokenInfo?.ticker)}
                    </span>
                  </Typography>
                  <CustomSlider
                    sx={{
                      marginX: 0,
                    }}
                    disabled={burnTokensMutation.isPending}
                    value={amountAsBalancePercentage}
                    valueLabelDisplay="auto"
                    shiftStep={1}
                    step={1}
                    min={1}
                    max={100}
                    valueLabelFormat={(burnAmount) => `${burnAmount}%`}
                    onChange={(_event, nextInput) => {
                      if (!tokenBalance) return

                      const newValue = (BigInt(nextInput as number) * BigInt(tokenBalance)) / 100n

                      setBurnAmount(
                        parseBigIntAsNumber(
                          newValue,
                          tokenInfo?.denomination,
                          nextInput === 100 ? tokenInfo?.denomination : INPUT_DECIMALS,
                        ),
                      )
                    }}
                  />
                </Stack>
              )}

              {burnTokensMutation.isPending && <p>Burning tokens...</p>}
              {burnTokensMutation.isSuccess && <p>Tokens burned successfully!</p>}
              {burnTokensMutation.isError && <p>Error: {burnTokensMutation.error.message}</p>}

              {activeAddr && (
                <Stack mt={4}>
                  <Typography variant="subtitle1" color="primary">
                    Your activity
                  </Typography>
                  {burnedBalanceLoading || burnedBalanceFetching ? (
                    <Skeleton width={100} height={35} />
                  ) : burnedBalanceError ? (
                    <p>Error: {burnedBalanceError.message}</p>
                  ) : (
                    <p>
                      You have burned: {parseBigIntAsNumber(burnedBalance, tokenInfo?.denomination)}{" "}
                      {formatTicker(tokenInfo?.ticker)}
                    </p>
                  )}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <>
          <Typography variant="subtitle1" color="primary">
            Latest burns
          </Typography>
          {latestBurnsLoading && latestBurns.length === 0 ? (
            <LoadingSkeletons />
          ) : (
            <Stack gap={1}>
              <Stack gap={0.5}>
                {latestBurns.map((msg, index) => (
                  <BurnRow key={msg.id} msg={msg} />
                ))}
              </Stack>
              {!endReached && (
                <Button
                  sx={{ textTransform: "none" }}
                  disabled={latestBurnsLoading}
                  onClick={() => {
                    setLatestBurnsLoading(true)
                    getAllBurns(latestBurnsPageSize, cursor).then((result) => {
                      setLatestBurns([...latestBurns, ...result])
                      setCursor(result[result.length - 1]?.cursor)
                      setLatestBurnsLoading(false)
                      if (result.length < latestBurnsPageSize) setEndReached(true)
                    })
                  }}
                >
                  {latestBurnsLoading ? "Loading..." : "Load more"}
                </Button>
              )}
            </Stack>
          )}
        </>
      )}
    </Typography>
  )
}

export function RenderedOption(props: { tokenId: string }) {
  const { tokenId } = props

  const [tokenInfo] = useTokenInfo(tokenId)

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexGrow={1}>
      <TokenAvatar tokenId={tokenId} size="large" />
      <Stack>
        <Typography component="div" variant="inherit" fontWeight={500}>
          {tokenInfo?.ticker}
        </Typography>
        <Typography component="span" variant="caption">
          {tokenId}
        </Typography>
      </Stack>
    </Stack>
  )
}

export function BurnRow(props: { msg: AoMessage }) {
  const { msg } = props

  const [tokenInfo] = useTokenInfo(msg.tags["Token"])

  if (!tokenInfo) return null

  return (
    <Stack direction="row" gap={1} alignItems="center">
      🔥
      {formatNumberAuto(parseBigIntAsNumber(msg.tags["Quantity"], tokenInfo?.denomination))}{" "}
      {formatTicker(tokenInfo?.ticker)} by
      <IdBlock label={truncateId(msg.to)} value={msg.to} />
    </Stack>
  )
}
