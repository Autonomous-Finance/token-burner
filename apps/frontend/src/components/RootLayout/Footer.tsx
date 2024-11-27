import { GitHub, X } from "@mui/icons-material"
import { Box, Button, Container, Link as MuiLink, Stack, Typography } from "@mui/material"
import React from "react"

import { AFLogo } from "./AFLogo"
import { DiscordLogo } from "./DiscordLogo"
import ENV from "@/env"

export function Footer() {
  return (
    <Box sx={{ width: "100%" }}>
      <Container maxWidth="xl">
        <Stack gap={4} sx={{ paddingY: 5, paddingX: 2 }}>
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            gap={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button href="https://autonomous.finance" target="_blank" variant="text">
              <AFLogo color="var(--mui-palette-text-primary)" />
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(158, 162, 170, 1)",
                  marginLeft: 1,
                  textTransform: "uppercase",
                }}
              >
                autonomous.finance
              </Typography>
            </Button>
            <Stack gap={3} direction="row" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                v{ENV.VITE_APP_VER?.replace(/"/g, "")} · {ENV.VITE_GIT_HASH?.substring(0, 6)}{" "}
                &middot; {ENV.VITE_ENV}
              </Typography>
              <MuiLink
                target="_blank"
                href="https://github.com/Autonomous-Finance"
                underline="hover"
                variant="body2"
                sx={{ color: "rgba(158, 162, 170, 1)" }}
              >
                <GitHub />
              </MuiLink>
              <MuiLink
                target="_blank"
                href="https://discord.gg/AK6C2PPWDc"
                underline="hover"
                variant="body2"
                sx={{ color: "rgba(158, 162, 170, 1)" }}
              >
                <DiscordLogo width={24} height={24} />
              </MuiLink>
              <MuiLink
                target="_blank"
                href="https://twitter.com/autonomous_af"
                underline="hover"
                variant="body2"
                sx={{ color: "rgba(158, 162, 170, 1)" }}
              >
                <X />
              </MuiLink>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
