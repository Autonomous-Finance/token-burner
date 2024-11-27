import {
  Box,
  Button,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useActiveAddress, useConnection } from "arweave-wallet-kit"
import type React from "react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { getBalance } from "@/api/token-api"
import { lockTokens } from "@/api/tokenlocker-api"
import { CustomSlider } from "@/components/CustomSlider"
import { IdBlock } from "@/components/IdBlock"
import ENV from "@/env"
import { useTokenInfo } from "@/hooks/use-token-info"
import { INPUT_DECIMALS } from "@/settings"

import { formatNumberAuto, parseBigIntAsNumber, parseNumberAsBigInt } from "@/utils/format"

const steps = [
  {
    label: "Bridge or buy qAR",
    description: (
      <>
        Before adding liquidity, you need to own both $AGENT and $qAR. You can buy any of these
        assets on Botega. $qAR can also be bridged on{" "}
        <MuiLink href="https://bridge.astrousd.com" target="_blank">
          Astro
        </MuiLink>
        .
      </>
    ),
  },
  {
    label: "Provide liquidity on Botega",
    description: (
      <>
        As soon as you own the two assets, in equal amounts, you are ready to provide liquidity on{" "}
        <MuiLink
          href="https://botega.arweave.net/#/add?tokenA=8rbAftv7RaPxFjFk5FGUVAVCSjGQB4JHDcb9P9wCVhQ&tokenB=NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8"
          target="_blank"
        >
          Botega
        </MuiLink>
        . You will receive LP tokens in return, which accrue fees from trades on the platform.
      </>
    ),
  },
  {
    label: "Lock liquidity for 30 days",
    description: `The final step for eligibility is to lock the LP tokens for 30 days.`,
  },
]

export function AirdropPage() {
  const [activeStep, setActiveStep] = useState(-1)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const [lockAmount, setLockAmount] = useState("")

  const activeAddr = useActiveAddress()

  const { data: lpBalance } = useQuery({
    queryKey: [`lpBalance`, activeAddr, ENV.VITE_LP_TOKEN],
    enabled: !!activeAddr,
    queryFn: async () => {
      if (!activeAddr) return "0"
      const lpBalance = await getBalance(ENV.VITE_LP_TOKEN, activeAddr)
      console.log("onLpBalance", lpBalance)
      return lpBalance.toString()
    },
  })

  const [lpToken] = useTokenInfo(ENV.VITE_LP_TOKEN)

  const amountAsBalancePercentage = useMemo(() => {
    if (!lpBalance || !lockAmount) return 0

    const valueNormalized = parseNumberAsBigInt(lockAmount, lpToken?.denomination)
    const percentage = (valueNormalized * 100n) / BigInt(lpBalance)

    console.log("onAmountAsBalancePercentageChange", { valueNormalized, lpBalance, percentage })

    return parseInt(percentage.toString())
  }, [lpBalance, lockAmount, lpToken])

  const { connect } = useConnection()

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const [receipt, setReceipt] = useState<string | null>(null)
  const [backendError, setBackendError] = useState<Error | null>(null)

  const handleDeposit = async () => {
    const newErrors: Record<string, string> = {}

    const lockAmountNormalized = parseNumberAsBigInt(lockAmount, lpToken?.denomination)

    if (!lockAmount || lockAmountNormalized === 0n) {
      newErrors.lockAmount = "Required"
    }

    if (!lpBalance || lockAmountNormalized > BigInt(lpBalance)) {
      newErrors.lockAmount = "Insufficient balance"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const receipt = await lockTokens({
        tokenProcess: ENV.VITE_LP_TOKEN,
        amount: lockAmountNormalized,
        // periodMs: 30 * 24 * 60 * 60 * 1000,
        periodMs: 15 * 60 * 1000, // TODO
      })

      setActiveStep((prevActiveStep) => prevActiveStep + 1)
      setReceipt(receipt)
    } catch (err: any) {
      setBackendError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack alignItems="center" mt={10} gap={20}>
      <Stack alignItems="center">
        <Typography variant="h4" fontWeight={500}>
          Airdrop Season II
        </Typography>
        <Typography mb={5}>Get LP rewards for providing liquidity</Typography>
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ maxWidth: 400 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
              // optional={index === 2 ? <Typography variant="caption">Last step</Typography> : null}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography>{step.description}</Typography>
                {index === 2 && activeAddr && (
                  <Stack mt={2} gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      margin="dense"
                      label="Lock amount"
                      disabled={loading}
                      type="number"
                      value={lockAmount}
                      onChange={(e) => setLockAmount(e.target.value)}
                      error={!!errors.lockAmount}
                      helperText={errors.lockAmount}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {lpToken?.ticker.replace("Botega LP", "")}
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Stack paddingX={2}>
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
                          {lpBalance === undefined ? (
                            <Skeleton width={60} sx={{ display: "inline-block" }} />
                          ) : (
                            formatNumberAuto(parseBigIntAsNumber(lpBalance, lpToken?.denomination))
                          )}{" "}
                          {lpToken?.ticker.replace("Botega LP", "")}
                        </span>
                      </Typography>{" "}
                      <CustomSlider
                        sx={{
                          marginX: 0,
                        }}
                        disabled={loading}
                        value={amountAsBalancePercentage}
                        valueLabelDisplay="auto"
                        shiftStep={1}
                        step={1}
                        min={1}
                        max={100}
                        valueLabelFormat={(lockAmount) => `${lockAmount}%`}
                        onChange={(_event, nextInput) => {
                          if (!lpBalance) return

                          const newValue = BigInt(nextInput as number) * BigInt(lpBalance)

                          setLockAmount(
                            parseBigIntAsNumber(
                              newValue / 100n,
                              lpToken?.denomination,
                              nextInput === 100 ? lpToken?.denomination : INPUT_DECIMALS,
                            ),
                          )
                        }}
                      />
                    </Stack>
                  </Stack>
                )}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <div>
                    {index === 2 ? (
                      <Button
                        variant="contained"
                        onClick={activeAddr ? handleDeposit : connect}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {activeAddr ? (loading ? "Depositing..." : "Deposit") : "Connect Wallet"}
                      </Button>
                    ) : (
                      <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                        Continue
                      </Button>
                    )}
                    <Button
                      disabled={index === 0 || loading}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3, mt: 5, width: 400 }}>
            <Typography variant="body2">
              Congratulations! 🎉🎉🎉
              <br />
              You are now eligible for LP Rewards.
              <br />
              <br />
              Visit <Link to="/">Home</Link> to see your rewards accrue in real-time.
              <br />
              <br />
              <Typography variant="caption" component="div">
                <IdBlock
                  label={"View on ao.link"}
                  value={receipt as string}
                  href={`https://ao.link/#/message/${receipt}`}
                  hideCopyToClipboard
                />
              </Typography>
            </Typography>
          </Paper>
        )}
        {activeStep === -1 && (
          <Button
            variant="contained"
            sx={{ mt: 5 }}
            onClick={() => {
              setActiveStep(0)
            }}
          >
            Get Started
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
