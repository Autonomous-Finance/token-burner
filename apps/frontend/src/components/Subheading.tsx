import { Typography, TypographyProps } from "@mui/material"
import React from "react"

export function Subheading(props: TypographyProps) {
  return <Typography variant="h6" component="div" sx={{ marginX: 2, marginY: 0.5 }} {...props} />
}
