import { dryrun } from "@permaweb/aoconnect"
import { useMutation, useQuery } from "@tanstack/react-query"

import { useActiveAddress } from "arweave-wallet-kit"
import React, { useState } from "react"

import TOKENBURNER from "../constants/TokenBurner_process"
import { useTokenInfo } from "../hooks/use-token-info"
import {
  burnTokens,
  getBurnedLpTokens,
  getBurnEvents,
  getBurnStats as getBurnStats,
} from "@/api/token-burner-api"
import { flattenTags } from "@/utils/arweave"
import { parseBigIntAsNumber, parseNumberAsBigInt } from "@/utils/format"

export default function TokenBurner() {
  const [tokenId, setTokenId] = useState("")
  const [burnAmount, setBurnAmount] = useState("")

  const activeAddr = useActiveAddress()

  const [tokenInfo] = useTokenInfo(tokenId)

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
      return result
    },
  })

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
      // queryClient.invalidateQueries(["burnerInfo", tokenId])
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

  if (infoError) {
    return <div>Error: {infoError.message}</div>
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      <div>
        <input
          type="text"
          placeholder="Enter Token Address"
          value={tokenId}
          onChange={(e) => {
            setTokenId(e.target.value)
            // Invalidate and refetch data when tokenId changes
            // queryClient.invalidateQueries(["burnerInfo", tokenId]) TODO
            refetchBurnEvents()
            refetchLPTokens()
          }}
          style={{ width: "300px", padding: "0.5rem" }}
        />
      </div>

      {tokenId && activeAddr && (
        <div>
          <h3>Burn Tokens</h3>
          <input
            type="text"
            placeholder="Amount to Burn"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
          />
          <button type="button" onClick={() => burnTokensMutation.mutate()}>
            Burn Tokens
          </button>
          {burnTokensMutation.isPending && <p>Burning tokens...</p>}
          {burnTokensMutation.isSuccess && <p>Tokens burned successfully!</p>}
          {burnTokensMutation.isError && <p>Error: {burnTokensMutation.error.message}</p>}
        </div>
      )}

      {tokenId && (
        <>
          <div>
            <h3>Overview</h3>
            {infoLoading || infoFetching ? (
              "Loading..."
            ) : burnerInfo ? (
              <div>
                <p>
                  Total Burn Events:{" "}
                  {burnerInfo.perTokenStats &&
                  burnerInfo.perTokenStats[tokenId] &&
                  burnerInfo.perTokenStats[tokenId].numBurns
                    ? burnerInfo.perTokenStats[tokenId].numBurns
                    : 0}
                </p>
                <p>
                  Total Burned:{" "}
                  {burnerInfo.perTokenStats &&
                  burnerInfo.perTokenStats[tokenId] &&
                  burnerInfo.perTokenStats[tokenId].totalBurned
                    ? parseBigIntAsNumber(
                        burnerInfo.perTokenStats[tokenId].totalBurned,
                        tokenInfo?.denomination,
                      )
                    : "0"}{" "}
                  {tokenInfo?.ticker}
                </p>
              </div>
            ) : (
              "No data available"
            )}
          </div>

          {activeAddr && (
            <div>
              <h3>Your activity</h3>
              {burnedBalanceLoading || burnedBalanceFetching ? (
                <p>Loading...</p>
              ) : burnedBalanceError ? (
                <p>Error: {burnedBalanceError.message}</p>
              ) : (
                <p>
                  You have burned: {parseBigIntAsNumber(burnedBalance, tokenInfo?.denomination)}{" "}
                  {tokenInfo?.ticker}
                </p>
              )}
            </div>
          )}

          <div>
            <h3>Latest burns</h3>
            {burnEventsLoading || burnEventsFetching ? (
              <p>Loading...</p>
            ) : burnEventsError ? (
              <p>Error: {burnEventsError.message}</p>
            ) : burnEventsData ? (
              <div>
                {burnEventsData.length > 0 ? (
                  <ul style={{ textAlign: "left" }}>
                    {burnEventsData.map((event, index) => (
                      <li key={index}>
                        User: {event.user} - Amount:{" "}
                        {parseBigIntAsNumber(event.amount, tokenInfo?.denomination)}{" "}
                        {tokenInfo?.ticker}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No burn events found.</p>
                )}
              </div>
            ) : null}
          </div>

          <div>
            <h3>Liquidity Pools containing this token</h3>
            {lpTokensLoading || lpTokensFetching ? (
              <p>Loading...</p>
            ) : lpTokensError ? (
              <p>Error: {lpTokensError.message}</p>
            ) : lpTokensData ? (
              <div>
                {lpTokensData.length > 0 ? (
                  <ul>
                    {lpTokensData.map((lpToken, index) => (
                      <li key={index} style={{ textAlign: "left" }}>
                        <p>LP Token ID: {lpToken.LpToken}</p>
                        <p>Token-A: {lpToken.Details["TokenA"]}</p>
                        <p>Token-B: {lpToken.Details["TokenB"]}</p>
                        <p>Burn History:</p>
                        <ul>
                          {lpToken.BurnHistory.map((event, idx) => (
                            <li key={idx}>
                              User: {event.user} - Amount:
                              {parseBigIntAsNumber(
                                event.amount,
                                Number(lpToken.Details.Denomination),
                              )}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No burned LP tokens found.</p>
                )}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
