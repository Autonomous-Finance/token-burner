import { Container, Stack, useScrollTrigger, Button } from "@mui/material"

import { useActiveAddress, useConnection } from "arweave-wallet-kit"

import { useMemo } from "react"
import { useLocation } from "react-router-dom"

import { truncateId } from "@/utils/data-utils"

const Header = () => {
  const elevated = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: typeof window !== "undefined" ? window : undefined,
  })

  const activeAddress = useActiveAddress()

  const location = useLocation()
  const page = useMemo<"home" | "airdrop" | undefined>(
    () => (location.pathname.includes("/airdrop") ? "airdrop" : "home"),
    [location],
  )
  const { connect, disconnect } = useConnection()

  return (
    <>
      <header>
        <Container
          maxWidth="xl"
          sx={{
            padding: "1.3rem 4rem",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            justifyItems: "center",

            "& > a:nth-child(1)": {
              justifySelf: "start",
            },
            "& > div:nth-child(3)": {
              justifySelf: "end",
            },
          }}
        >
          {/* Logo */}
          <div></div>
          {/* <Box component={Link} to="/" sx={{ height: "20px" }}>
            AGENT
          </Box> */}

          {/* Menu links */}

          {/* Right side buttons */}

          <Stack direction="row" gap={1} alignItems="stretch">
            {/* <ThemeMode /> */}
            <Button
              onClick={!activeAddress ? connect : disconnect}
              variant="outlined"
              color="accent"
              sx={{ textTransform: "none" }}
            >
              {activeAddress ? truncateId(activeAddress) : "Connect Wallet to Burn Tokens"}{" "}
            </Button>
          </Stack>
        </Container>
      </header>
      {/* <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.default",
          border: 0,
          borderBottom: "1px solid transparent",
          ...(elevated
            ? {
                borderColor: "var(--mui-palette-divider)",
              }
            : {}),
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Stack
              direction="row"
              gap={2}
              justifyContent="flex-end"
              alignItems="center"
              sx={{ width: "100%" }}
              flexWrap="wrap"
            >
            </Stack>
          </Toolbar>
        </Container>
      </AppBar> */}
    </>
  )
}

export default Header
