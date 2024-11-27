import { Alert, Button, Skeleton, Stack, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useActiveAddress, useConnection } from "arweave-wallet-kit"
import { motion } from "framer-motion"
import type React from "react"

import { useMemo, useState } from "react"

import { getBalance } from "@/api/token-api"
import {
  withdrawTokens,
  getUserLockedTokens,
  getUserRewards,
  claimRewards,
  getInfo,
} from "@/api/tokenlocker-api"
import { TokenAmountBlock } from "@/components/TokenAmountBlock"
import ENV from "@/env"
import { useTokenInfo } from "@/hooks/use-token-info"
import { formatFullDate } from "@/utils/format"

export function HomePage() {
  const activeAddr = useActiveAddress()

  const { data: agentTokenBalance } = useQuery({
    queryKey: ["agentTokenBalance", activeAddr],
    enabled: !!activeAddr,
    queryFn: async () => {
      if (!activeAddr) return "0"
      const balance = await getBalance(ENV.VITE_AGENT_TOKEN, activeAddr)
      console.log("onAgentBalance", balance)
      return balance.toString()
    },
  })

  const { data: lpBalance, refetch: refetchLpBalance } = useQuery({
    queryKey: [`lpBalance`, activeAddr],
    enabled: !!activeAddr,
    queryFn: async () => {
      if (!activeAddr) return "0"
      const balance = await getBalance(ENV.VITE_LP_TOKEN, activeAddr)
      console.log("onLpBalance", balance)
      return balance.toString()
    },
  })

  const { data: lpBalanceLocked, refetch: refetchLpBalanceLocked } = useQuery({
    queryKey: [`lpBalanceLocked`, activeAddr],
    enabled: !!activeAddr,
    queryFn: async () => {
      if (!activeAddr) return undefined
      const balance = await getUserLockedTokens(activeAddr)
      console.log("onLpBalanceLocked", balance)
      return balance
    },
  })

  const { data: userRewards, refetch: refetchUserRewards } = useQuery({
    queryKey: [`userRewards`, activeAddr],
    enabled: !!activeAddr,
    queryFn: async () => {
      if (!activeAddr) return undefined
      const res = await getUserRewards(activeAddr)
      console.log("onUserRewards", res)
      return res
    },
  })

  const { data: lockerInfo, refetch: refetchLockerInfo } = useQuery({
    queryKey: [`locker-info`],
    queryFn: async () => {
      const res = await getInfo()
      console.log("onLockerInfo", res)
      return res
    },
  })

  const [agentToken] = useTokenInfo(ENV.VITE_AGENT_TOKEN)
  const [lpToken] = useTokenInfo(ENV.VITE_LP_TOKEN)

  const { connect } = useConnection()

  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const [receipt, setReceipt] = useState<string | null>(null)
  const [backendError, setBackendError] = useState<Error | null>(null)

  const handleWithdraw = async () => {
    if (!availableToWithdraw) return
    setWithdrawLoading(true)

    try {
      const receipt = await withdrawTokens(ENV.VITE_LP_TOKEN, availableToWithdraw)
      setReceipt(receipt)
      await Promise.all([refetchLpBalance(), refetchLpBalanceLocked()])
    } catch (err: any) {
      setBackendError(err)
    } finally {
      setWithdrawLoading(false)
    }
  }

  const [claimLoading, setClaimLoading] = useState(false)

  const handleClaim = async () => {
    if (!userRewards || BigInt(userRewards.AvailableUserRewards) === 0n) return

    setClaimLoading(true)

    try {
      const receipt = await claimRewards()
      setReceipt(receipt)
      await Promise.all([
        refetchLpBalance(),
        refetchLpBalanceLocked(),
        refetchUserRewards(),
        refetchLockerInfo(),
      ])
    } catch (err: any) {
      setBackendError(err)
    } finally {
      setClaimLoading(false)
    }
  }

  const [totalLocked, availableToWithdraw, latestWithdrawDate, nextUnlockDate] = useMemo(() => {
    if (!lpBalanceLocked) return []

    let total = BigInt(0)
    let available = BigInt(0)
    let latestWithdrawDate = 0
    let nextUnlockDate = Number.MAX_SAFE_INTEGER

    for (const locked of lpBalanceLocked.TokensLocked) {
      total += BigInt(locked.Amount)
      if (locked.CanWithdraw) {
        available += BigInt(locked.Amount)
      } else {
        if (nextUnlockDate > locked.LockEnd) {
          nextUnlockDate = locked.LockEnd
        }
        if (latestWithdrawDate < locked.LockEnd) {
          latestWithdrawDate = locked.LockEnd
        }
      }
    }

    return [total, available, latestWithdrawDate, nextUnlockDate]
  }, [lpBalanceLocked])

  return (
    <Stack alignItems="center" mt={10} gap={10}>
      <Stack alignItems={"center"} gap={1}>
        <Typography
          variant="h2"
          fontWeight={500}
          sx={{
            "& img": {
              borderRadius: "50%",
            },
          }}
          component={Stack}
          direction="row"
          gap={4}
          alignItems="center"
        >
          {/* <span>Activate Your</span> */}
          <motion.img
            width={64}
            height={64}
            src="/agent.webp"
            alt={agentToken?.ticker}
            className="rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          />{" "}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            ${agentToken?.ticker}
          </motion.span>
        </Typography>
        <Typography>Power Up the On-Chain Agent Economy!</Typography>
        {lockerInfo ? (
          <>
            <Typography>
              Liquidity Providers are enjoying{" "}
              <TokenAmountBlock
                amount={
                  BigInt(lockerInfo["Rewards-Module"].RewardsPerEpoch) *
                  BigInt(lockerInfo["Rewards-Module"].Epochs)
                }
                tokenId={ENV.VITE_AGENT_TOKEN}
                needsParsing
                showTicker
                hideCopyToClipboard
                color="accent.main"
              />{" "}
              of rewards.
            </Typography>
            <Typography
              component={Stack}
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <span>They are currently locking</span>
              <span>
                <TokenAmountBlock
                  amount={lockerInfo["Lock-Module"].TotalLocked}
                  tokenId={ENV.VITE_LP_TOKEN}
                  needsParsing
                  showTicker
                  hideCopyToClipboard
                  color="accent.main"
                />
                .
              </span>
            </Typography>
            <Typography
              component={Stack}
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <span>
                <TokenAmountBlock
                  amount={BigInt(lockerInfo["Rewards-Module"].RewardsPerEpoch)}
                  tokenId={ENV.VITE_AGENT_TOKEN}
                  needsParsing
                  showTicker
                  hideCopyToClipboard
                  color="accent.main"
                />
              </span>
              <span>
                is distributed being every{" "}
                {Number(lockerInfo["Rewards-Module"].EpochTime) / 60 / 1000} minutes.
              </span>
            </Typography>
          </>
        ) : (
          <>
            <Skeleton width={300} />
            <Skeleton width={280} />
            <Skeleton width={260} />
          </>
        )}
      </Stack>
      {activeAddr ? (
        <Stack sx={{ width: 550 }}>
          <Typography variant="h4" mt={0} fontWeight={500}>
            Your Wallet
          </Typography>
          <Typography
            component={Stack}
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <span>Balance</span>
            <span>
              {agentTokenBalance === undefined ? (
                <Skeleton width={60} sx={{ display: "inline-block" }} />
              ) : (
                <TokenAmountBlock
                  amount={agentTokenBalance || 0n}
                  tokenId={ENV.VITE_AGENT_TOKEN}
                  needsParsing
                  showTicker
                  color="accent.main"
                />
              )}
            </span>
          </Typography>
          <Typography
            component={Stack}
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <span>LP Balance</span>
            <span>
              {lpBalance === undefined ? (
                <Skeleton width={60} sx={{ display: "inline-block" }} />
              ) : (
                <TokenAmountBlock
                  amount={lpBalance || 0n}
                  tokenId={ENV.VITE_LP_TOKEN}
                  needsParsing
                  showTicker
                  color="accent.main"
                />
              )}
            </span>
          </Typography>
          <Typography variant="h4" mt={10} fontWeight={500}>
            Rewards Locker
          </Typography>
          <Typography
            component={Stack}
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <span>Total locked</span>
            <span>
              {lpBalanceLocked === undefined ? (
                <Skeleton width={60} sx={{ display: "inline-block" }} />
              ) : (
                <TokenAmountBlock
                  amount={totalLocked || 0n}
                  tokenId={ENV.VITE_LP_TOKEN}
                  needsParsing
                  showTicker
                  color="accent.main"
                />
              )}
            </span>
          </Typography>
          {!!nextUnlockDate && nextUnlockDate < Number.MAX_SAFE_INTEGER && (
            <Typography
              component={Stack}
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{ mr: 2.5 }}
            >
              <span>Next unlock date</span>
              <span>{formatFullDate(nextUnlockDate)}</span>
            </Typography>
          )}
          {!!latestWithdrawDate && latestWithdrawDate > 0 && (
            <Typography
              component={Stack}
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{ mr: 2.5 }}
            >
              <span>Last unlock date</span>
              <span>{formatFullDate(latestWithdrawDate)}</span>
            </Typography>
          )}
          <Typography
            component={Stack}
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <span>Available to Withdraw</span>
            <span>
              {lpBalanceLocked === undefined ? (
                <Skeleton width={60} sx={{ display: "inline-block" }} />
              ) : (
                <TokenAmountBlock
                  amount={availableToWithdraw || 0n}
                  tokenId={ENV.VITE_LP_TOKEN}
                  needsParsing
                  showTicker
                  color="accent.main"
                />
              )}
            </span>
          </Typography>
          {!!availableToWithdraw && availableToWithdraw >= 0 && (
            <>
              <Alert
                severity="info"
                sx={{ mt: 2, borderRadius: "10px" }}
                variant="outlined"
                color={"secondary" as any}
              >
                <Typography variant="caption">
                  Your unlocked tokens still receive rewards, as long as you don't withdraw.
                </Typography>
              </Alert>
              <Button
                variant="contained"
                onClick={handleWithdraw}
                disabled={withdrawLoading}
                sx={{ my: 1, alignSelf: "flex-end", mr: 1 }}
              >
                {withdrawLoading ? "Withdrawing..." : "Withdraw"}
              </Button>
            </>
          )}
          <Typography variant="h4" mt={10} fontWeight={500}>
            Rewards
          </Typography>
          <Typography
            component={Stack}
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <span>Total Earned</span>
            <span>
              {userRewards === undefined ? (
                <Skeleton width={60} sx={{ display: "inline-block" }} />
              ) : userRewards === null ? (
                "Error"
              ) : (
                <TokenAmountBlock
                  amount={
                    BigInt(userRewards.TotalClaimed) + BigInt(userRewards?.AvailableUserRewards)
                  }
                  tokenId={ENV.VITE_AGENT_TOKEN}
                  needsParsing
                  showTicker
                  color="accent.main"
                />
              )}
            </span>
          </Typography>
          <Typography
            component={Stack}
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <span>Claimed</span>
            <span>
              {userRewards === undefined ? (
                <Skeleton width={60} sx={{ display: "inline-block" }} />
              ) : userRewards === null ? (
                "Error"
              ) : (
                <TokenAmountBlock
                  amount={userRewards.TotalClaimed}
                  tokenId={ENV.VITE_AGENT_TOKEN}
                  needsParsing
                  showTicker
                  color="accent.main"
                />
              )}
            </span>
          </Typography>
          <Typography
            component={Stack}
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <span>Available to Claim</span>
            <span>
              {userRewards === undefined ? (
                <Skeleton width={60} sx={{ display: "inline-block" }} />
              ) : userRewards === null ? (
                "Error"
              ) : (
                <TokenAmountBlock
                  amount={userRewards.AvailableUserRewards}
                  tokenId={ENV.VITE_AGENT_TOKEN}
                  needsParsing
                  showTicker
                  color="accent.main"
                />
              )}
            </span>
          </Typography>
          {!!userRewards && BigInt(userRewards.AvailableUserRewards) > 0 && (
            <>
              <Button
                variant="contained"
                onClick={handleClaim}
                sx={{ my: 1, alignSelf: "flex-end", mr: 1 }}
                disabled={claimLoading}
              >
                {claimLoading ? "Claiming..." : "Claim"}
              </Button>
            </>
          )}
        </Stack>
      ) : (
        <Button variant="contained" color="primary" onClick={connect}>
          Connect Wallet
        </Button>
      )}
    </Stack>
  )
}
