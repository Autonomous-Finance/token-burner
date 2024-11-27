import {
  Analytics,
  ShowChart,
  Lock,
  PriceChange,
  History,
  Group,
  BarChartSharp,
} from "@mui/icons-material"
import { Box, Button, Paper, Skeleton, Stack, Tab, Tabs, Typography, useTheme } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import React from "react"
import { Link, useParams } from "react-router-dom"

import { IdBlock } from "@/components/IdBlock"
import { Subheading } from "@/components/Subheading"

import { DEXI_SUBSCRIBE_FULL_PRICE } from "@/settings"
import { truncateId } from "@/utils/data-utils"

export default function OnboardingPoolCTA() {
  const { poolId } = useParams()
  const theme = useTheme()

  return (
    <>
      <Grid2 container spacing={2}>
        <Grid2 xs={12}>
          <Subheading>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" gap={2} alignItems="center">
                <span>Pool</span>
                <IdBlock
                  label={truncateId(poolId as string)}
                  value={poolId}
                  href={`https://ao.link/#/entity/${poolId}`}
                />
              </Stack>
            </Stack>
          </Subheading>
        </Grid2>
        <Grid2 xs={12} lg={3}>
          <Stack>
            <Skeleton height={40} animation={false} />
            <Skeleton height={40} animation={false} />
            <Skeleton height={40} animation={false} />
            <Skeleton height={40} animation={false} />
            <Skeleton height={200} animation={false} />
            <Skeleton height={200} animation={false} />
          </Stack>
        </Grid2>
        <Grid2 lg={9}>
          <Stack>
            <Paper sx={{ height: 600, overflow: "hidden" }}>
              <Skeleton variant="rectangular" height={600} animation={false} />
            </Paper>
            <Tabs value={0}>
              <Tab value={0} label="Transactions" />
              <Tab value={1} label="Liquidity" />
              <Tab value={2} label="Token Holders" />
              <Tab value={3} label="Locked Liquidity" />
            </Tabs>
            <Skeleton variant="rectangular" height={300} animation={false} />
          </Stack>
        </Grid2>
      </Grid2>
      {/* Dark mode glass overlay */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(5px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* CTA Modal */}
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          <Stack spacing={4}>
            <Typography variant="h5" gutterBottom>
              Pool not yet Active in DEXI
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Subscribe now and gain valuable insights!
              <br />
              By subscribing, you'll unlock:
            </Typography>
            <Paper
              sx={{
                padding: 3,
                backgroundColor: theme.palette.background.default,
              }}
            >
              <Stack direction="column" spacing={2}>
                {[
                  {
                    icon: <Analytics />,
                    text: "Detailed analytics and performance tracking",
                  },
                  { icon: <ShowChart />, text: "Advanced candlestick charts" },
                  {
                    icon: <BarChartSharp />,
                    text: "In-depth liquidity information",
                  },
                  { icon: <Lock />, text: "Liquidity lock details" },
                  { icon: <PriceChange />, text: "Real-time token prices" },
                  { icon: <History />, text: "Historical transaction data" },
                  { icon: <Group />, text: "Token holder insights" },
                ].map((item, index) => (
                  <Stack key={index} direction="row" alignItems="center" spacing={2}>
                    {item.icon}
                    <Typography variant="body1">{item.text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Box>
              <Typography variant="h6" gutterBottom>
                Subscription Price:
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                <Typography variant="h5" color="primary">
                  ${DEXI_SUBSCRIBE_FULL_PRICE}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (One-time fee)
                </Typography>
              </Stack>
            </Box>

            <Link to={`/onboarding-pool/${poolId}`} style={{ textDecoration: "none" }}>
              <Button variant="contained" color="primary" size="large" fullWidth>
                Subscribe now!
              </Button>
            </Link>
          </Stack>
        </Box>
      </Box>
    </>
  )
}
