import React, { useState, useEffect, act } from "react";
import {
    createDataItemSigner,
    dryrun,
    message,
    result,
} from "@permaweb/aoconnect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TOKENBURNER from "../constants/TokenBurner_process";
import { useActiveAddress } from "arweave-wallet-kit";
import { useTokenInfo } from "../hooks/use-token-info";

export default function TokenBurner() {
    const queryClient = useQueryClient();
    const [tokenId, setTokenId] = useState("");
    const [burnAmount, setBurnAmount] = useState("");
    
    const activeAddr = useActiveAddress()

    const [tokenInfo] = useTokenInfo(tokenId);


    const {
        data: burnerInfo,
        error: infoError,
        isLoading: infoLoading,
        isFetching: infoFetching,
    } = useQuery({
        enabled: !!tokenId, // Only run when tokenId is provided
        queryKey: ["burnerInfo", tokenId],
        queryFn: async () => {
            const dryrunResult = await dryrun({
                process: TOKENBURNER,
                tags: [
                    {
                        name: "Action",
                        value: "Info",
                    },
                ],
            });

            if (dryrunResult.Messages[0].Data) {
                return JSON.parse(dryrunResult.Messages[0].Data);
            }

            return undefined;
        },
    });

    // Mutation to get burned balance for a token and recipient
    const getBurnedBalance = useMutation({
        mutationKey: ["GetBurnedBalance"],
        mutationFn: async ({ tokenId, recipient }) => {
            const messageId = await message({
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
                    ...(recipient ? [{ name: "Recipient", value: recipient }] : []),
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: TOKENBURNER,
                message: messageId,
            });
            console.log("📜 LOG > mutationFn: > messageResult:", messageResult);

            if (messageResult.Messages[0].Tags.Quantity) {
                return messageResult.Messages[0].Tags.Quantity;
            }

            return "0";
        },
    });

    // Mutation to get burn events for a token
    const getBurnEvents = useMutation(
        async () => {
            const messageId = await message({
                process: TOKENBURNER,
                tags: [
                    {
                        name: "Action",
                        value: "Get-Burns",
                    },
                    {
                        name: "Token",
                        value: tokenId,
                    },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: TOKENBURNER,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }

            return [];
        }
    );

    // Mutation to burn tokens
    const burnTokens = useMutation({
        mutationKey: ["BurnTokens", activeAddr],
        mutationFn: async () => {
            if (!activeAddr) {
                throw new Error("Wallet not connected");
            }

            if (!burnAmount || !tokenId) {
                throw new Error("Token ID and amount are required");
            }

            // Transfer tokens to the burner process
            const messageId = await message({
                process: tokenId,
                tags: [
                    {
                        name: "Action",
                        value: "Transfer",
                    },
                    {
                        name: "Recipient",
                        value: TOKENBURNER,
                    },
                    {
                        name: "Quantity",
                        value: burnAmount,
                    },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            // Wait for the burn confirmation
            const messageResult = await result({
                process: TOKENBURNER,
                message: messageId,
            });

            return messageResult.Messages[0].Tags;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["burnerInfo", tokenId]);
            getBurnedBalance.mutate();
            getBurnEvents.mutate();
        },
    });

    // Mutation to get LP tokens associated with the inputted token
    const getLPTokens = useMutation({
        mutationKey: ["BurnTokens", activeAddr],
        mutationFn: async () => {
            const messageId = await message({
                process: TOKENBURNER,
                tags: [
                    {
                        name: "Action",
                        value: "Get-LP-Burn-History",
                    },
                    {
                        name: "Token",
                        value: tokenId,
                    },
                ],
                data: "",
                signer: createDataItemSigner(window.arweaveWallet),
            });

            const messageResult = await result({
                process: TOKENBURNER,
                message: messageId,
            });

            if (messageResult.Messages[0].Data) {
                return JSON.parse(messageResult.Messages[0].Data);
            }

            return [];
        }}
    );

    if (infoError) {
        return <div>Error: {infoError.message}</div>;
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
            <h2>Token Burner</h2>
            <div>
                <input
                    type="text"
                    placeholder="Enter Token Address"
                    value={tokenId}
                    onChange={(e) => {
                        setTokenId(e.target.value);
                        // Invalidate and refetch data when tokenId changes
                        queryClient.invalidateQueries(["burnerInfo", tokenId]);
                        getBurnedBalance.reset();
                        getBurnEvents.reset();
                        getLPTokens.reset();
                    }}
                    style={{ width: "300px", padding: "0.5rem" }}
                />
            </div>

            {tokenId && (
                <>
                    <div>
                        <h3>Burner Stats for Token {tokenInfo?.ticker}:</h3>
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
                                    Total Amount Burned:{" "}
                                    {burnerInfo.perTokenStats &&
                                    burnerInfo.perTokenStats[tokenId] &&
                                    burnerInfo.perTokenStats[tokenId].totalBurned
                                        ? burnerInfo.perTokenStats[tokenId].totalBurned
                                        : "0"}
                                </p>
                            </div>
                        ) : (
                            "No data available"
                        )}
                    </div>

                    {activeAddr && (
                        <div>
                            <h3>Your Burned Balance for Token {tokenInfo?.ticker}:</h3>
                            <button
                                type="button"
                                onClick={() => getBurnedBalance.mutate()}
                            >
                                Get Your Burned Balance
                            </button>
                            {getBurnedBalance.isLoading && <p>Loading...</p>}
                            {getBurnedBalance.isSuccess && (
                                <p>
                                    You have burned: {getBurnedBalance.data} tokens
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <h3>Burn Events for Token {tokenInfo?.ticker}:</h3>
                        <button
                            type="button"
                            onClick={() => getBurnEvents.mutate()}
                        >
                            Get Burn Events
                        </button>
                        {getBurnEvents.isLoading && <p>Loading...</p>}
                        {getBurnEvents.isSuccess && (
                            <div>
                                {getBurnEvents.data.length > 0 ? (
                                    <ul>
                                        {getBurnEvents.data.map(
                                            (event, index) => (
                                                <li key={index}>
                                                    User: {event.user}, Amount:{" "}
                                                    {event.amount}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No burn events found.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {activeAddr && (
                        <div>
                            <h3>Burn Tokens</h3>
                            <input
                                type="text"
                                placeholder="Amount to Burn"
                                value={burnAmount}
                                onChange={(e) => setBurnAmount(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => burnTokens.mutate()}
                            >
                                Burn Tokens
                            </button>
                            {burnTokens.isLoading && <p>Burning tokens...</p>}
                            {burnTokens.isSuccess && (
                                <p>Tokens burned successfully!</p>
                            )}
                            {burnTokens.isError && (
                                <p>Error: {burnTokens.error.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <h3>LP Tokens Associated with Token {tokenInfo?.ticker}:</h3>
                        <button
                            type="button"
                            onClick={() => getLPTokens.mutate()}
                        >
                            Get LP Tokens
                        </button>
                        {getLPTokens.isLoading && <p>Loading...</p>}
                        {getLPTokens.isSuccess && (
                            <div>
                                {getLPTokens.data.length > 0 ? (
                                    <ul>
                                        {getLPTokens.data.map(
                                            (lpToken, index) => (
                                                <li key={index}>
                                                    <p>
                                                        LP Token ID: {lpToken.LpToken}
                                                    </p>
                                                    <p>
                                                        Token-A:{" "}
                                                        {lpToken.Details["Token-A"]}
                                                    </p>
                                                    <p>
                                                        Token-B:{" "}
                                                        {lpToken.Details["Token-B"]}
                                                    </p>
                                                    <p>Burn History:</p>
                                                    <ul>
                                                        {lpToken.BurnHistory.map(
                                                            (event, idx) => (
                                                                <li key={idx}>
                                                                    User: {event.user}, Amount:{" "}
                                                                    {event.amount}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No LP tokens found.</p>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
