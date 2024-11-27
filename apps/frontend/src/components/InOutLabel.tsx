import { Stack, Typography } from "@mui/material"
import React from "react"

import { NumberFont } from "./RootLayout/fonts"

export function InOutLabel({ outbound }: { outbound: boolean }) {
  return (
    <>
      <Stack
        alignItems="center"
        sx={{
          padding: 0.5,
          width: 36,
          color: "black",
          background: outbound ? "var(--mui-palette-orange)" : "var(--mui-palette-green)",
        }}
      >
        <Typography variant="caption" fontFamily={NumberFont}>
          {outbound ? "OUT" : "IN"}
        </Typography>
      </Stack>
    </>
  )
}
