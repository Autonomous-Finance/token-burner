import { zodResolver } from "@hookform/resolvers/zod"
import { Avatar, Button, Link, Stack, TextField, Typography } from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { useActiveAddress, useConnection } from "arweave-wallet-kit"
import numbro from "numbro"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Pool } from "@/api/pools-api"
import { usePool } from "@/context/PoolContext"
import useHopperPrice from "@/hooks/useHopper"
import useTokenBalance from "@/hooks/useTokenBalance"
import { useTokenInfo } from "@/hooks/useTokenInfo"
import useTokenPrice from "@/hooks/useTokenPrice"
import { swap } from "@/utils/bark"
import { formatNumberAuto } from "@/utils/format"
import { formatUnits, parseUnits } from "@/utils/math"

export default function BuyOnBark({
  pool,
  handleForceRefresh,
}: {
  pool: Pool
  handleForceRefresh: () => void
}) {
  const { isReversed } = usePool()
  const baseToken = !isReversed ? pool.baseToken : pool.quoteToken
  const quoteToken = !isReversed ? pool.quoteToken : pool.baseToken

  const baseTokenDetails = useTokenInfo(baseToken)
  const quoteTokenDetails = useTokenInfo(quoteToken)

  const activeAddress = useActiveAddress()
  const { connect } = useConnection()

  const { data: quoteTokenBalance } = useTokenBalance(quoteToken)

  const { data: hopperPrice } = useHopperPrice(baseToken, "usd")

  const formSchema = z.object({
    fromAmount: z
      .number()
      .positive({ message: "Amount must be positive" })
      .max(Number(formatUnits(quoteTokenBalance || 0n, quoteTokenDetails?.denomination || 18)), {
        message: "Not enough balance",
      }),
    slippage: z
      .number()
      .min(0, { message: "Slippage cannot be negative" })
      .max(100, { message: "Slippage cannot exceed 100%" }),
  })

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromAmount: 0,
      slippage: 0.5,
    },
  })

  const fromAmount = parseUnits(
    Number.isNaN(watch("fromAmount")) ? "0" : watch("fromAmount").toString(),
    quoteTokenDetails?.denomination || 18,
  ).toString()

  // Token Price Calculation on AO
  const { data: tokenPrice } = useTokenPrice(pool.id, quoteToken, fromAmount)

  // Calculate min output using slippage tolerance
  const slippage = Number.isNaN(watch("slippage")) ? 0 : watch("slippage")

  const normalizedMinOutput = Number(
    formatUnits(tokenPrice || 0n, baseTokenDetails?.denomination || 18),
  )

  // Add slippage tolerance (%) to the normalizedMinOutput number
  const normalizedTokenPrice = normalizedMinOutput + normalizedMinOutput * (slippage / 100)

  // Swap Mutation
  const swapMutation = useMutation({
    mutationKey: ["buy", pool.id],
    mutationFn: async () =>
      swap({
        pool: pool.id,
        token: quoteToken,
        input: BigInt(fromAmount),
        minOutput: parseUnits(
          normalizedTokenPrice.toString(),
          quoteTokenDetails?.denomination || 18,
        ),
      }),
    onSuccess: () => {
      setTimeout(() => {
        handleForceRefresh()
      }, 5000)
    },
  })

  if (!baseTokenDetails || !quoteTokenDetails) return null

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submit", values)

    await swapMutation.mutateAsync()

    reset()
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4} sx={{ paddingTop: 2 }}>
          <Stack gap={0.5}>
            <TextField
              id="fromAmount"
              label={
                <Stack direction="row" gap={1}>
                  <Avatar
                    src={`https://arweave.net/${quoteTokenDetails.logo}`}
                    alt={quoteTokenDetails.name}
                    sx={{ width: 24, height: 24 }}
                  />
                  {quoteTokenDetails.ticker}
                  <span>
                    (
                    {numbro(
                      Number(formatUnits(quoteTokenBalance || 0n, quoteTokenDetails.denomination)),
                    ).format({ mantissa: 2 })}
                    )
                  </span>
                </Stack>
              }
              error={!!errors.fromAmount?.message}
              helperText={errors.fromAmount?.message}
              defaultValue={0}
              {...register("fromAmount", { valueAsNumber: true })}
            />
            <Stack direction="row" gap={0.5} alignItems="center" justifyContent="space-between">
              <Button onClick={() => setValue("fromAmount", 0.1)}>0.1</Button>
              <Button onClick={() => setValue("fromAmount", 1)}>1</Button>
              <Button onClick={() => setValue("fromAmount", 10)}>10</Button>
              <Button onClick={() => setValue("fromAmount", 100)}>100</Button>
            </Stack>
          </Stack>

          <Stack gap={0.5}>
            <TextField
              id="slippage"
              label="Slippage (%)"
              error={!!errors.slippage?.message}
              helperText={errors.slippage?.message}
              defaultValue={0}
              {...register("slippage", { valueAsNumber: true })}
            />
            <Stack direction="row" gap={0.5} alignItems="center" justifyContent="space-between">
              <Button onClick={() => setValue("slippage", 0.5)}>0.5%</Button>
              <Button onClick={() => setValue("slippage", 1)}>1%</Button>
              <Button onClick={() => setValue("slippage", 3)}>3%</Button>
              <Button onClick={() => setValue("slippage", 5)}>5%</Button>
            </Stack>
          </Stack>

          {activeAddress ? (
            <Button
              variant="contained"
              type="submit"
              disabled={swapMutation.isPending || fromAmount === "0"}
            >
              {swapMutation.isPending
                ? "Swapping..."
                : `Buy ${formatNumberAuto(normalizedTokenPrice)} ${baseTokenDetails.ticker}`}
            </Button>
          ) : (
            <Button variant="contained" onClick={connect}>
              Connect Wallet
            </Button>
          )}

          {swapMutation.isSuccess ? (
            <Stack gap={2}>
              <Typography variant="body2" color="green" textAlign="center">
                Swap successful
              </Typography>
              <Link
                href={`https://ao.link/#/message/${swapMutation.data}`}
                target="_blank"
                rel="noreferrer"
                textAlign="center"
                variant="button"
              >
                View on ao.link
              </Link>
            </Stack>
          ) : (
            <Stack textAlign="center" gap={1}>
              <Typography variant="body2">you will receive min.</Typography>
              <Typography sx={{ fontSize: "1.35rem", fontWeight: 700 }}>
                {formatNumberAuto(normalizedTokenPrice)} {baseTokenDetails.ticker}
              </Typography>
              <Typography variant="body2" color="grey">
                ~ {formatNumberAuto(Number((hopperPrice ?? 0) * normalizedTokenPrice))} USD
              </Typography>
            </Stack>
          )}
        </Stack>
      </form>
    </>
  )
}
