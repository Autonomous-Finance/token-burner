import { Stack, type StackProps, Typography } from "@mui/material"
import type React from "react"

import { NumberFont } from "./RootLayout/fonts"

type SectionInfoProps = {
  title: string
  renderTitle?: () => React.ReactNode
  value: React.ReactNode
} & StackProps

export const SectionInfo = ({ title, renderTitle, value, ...rest }: SectionInfoProps) => (
  <Stack gap={1} direction="row" justifyContent="space-between" {...rest}>
    {renderTitle ? (
      renderTitle()
    ) : (
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
    )}

    <Typography variant="body2" fontFamily={NumberFont} component="div">
      {value}
    </Typography>
  </Stack>
)
