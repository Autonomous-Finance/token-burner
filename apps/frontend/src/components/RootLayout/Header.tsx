import { Container, Stack, useScrollTrigger, Box } from "@mui/material"

import { ConnectButton, useActiveAddress } from "arweave-wallet-kit"

import { useMemo } from "react"
import { useLocation } from "react-router-dom"

import { MainFontFF } from "./fonts"

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
            <Box
              sx={{
                "&.MuiBox-root > button > div": {
                  height: "fit-content",
                  padding: 0,
                },
                "&.MuiBox-root button": {
                  height: "100%",
                  borderRadius: 1,
                  border: "1px solid var(--mui-palette-accent-main)",
                  paddingX: 2.5,
                  paddingY: 1,
                  color: "var(--mui-palette-accent-main)",
                  background: "rgba(var(--mui-palette-accent-mainChannel) / 0.05)",
                },
                "&.MuiBox-root button:active": {
                  transform: "scale(0.98) !important",
                },
                "& button:hover": {
                  transform: "none !important",
                  boxShadow: "none !important",
                },
                "& button > *": {
                  fontWeight: 500,
                  fontFamily: MainFontFF,
                  textTransform: "none",
                  lineHeight: 1,
                  fontSize: "0.8125rem",
                  padding: 0,
                },
                "& button  svg": {
                  marginY: -1,
                },
              }}
            >
              <ConnectButton
                id="connect-wallet-button"
                showBalance={false}
                showProfilePicture={false}
              />
            </Box>
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
