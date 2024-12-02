import { Box, Button, Container, Link as MuiLink, Stack, Typography } from "@mui/material"
import React from "react"

import { AFLogo } from "./AFLogo"

export function Footer() {
  return (
    <Box sx={{ width: "100%" }}>
      <Container maxWidth="xl">
        <Stack gap={4} sx={{ paddingY: 5, paddingX: 2 }}>
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            gap={2}
            justifyContent="center"
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
            •{" "}
            <MuiLink
              target="_blank"
              href="https://docs.autonomous.finance"
              underline="hover"
              variant="body2"
              sx={{ color: "var(--mui-palette-text-secondary)" }}
            >
              Documentation
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
