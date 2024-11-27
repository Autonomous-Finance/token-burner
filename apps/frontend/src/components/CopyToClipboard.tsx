"use client"

import { CheckSharp, ContentCopySharp } from "@mui/icons-material"
import { Box, Tooltip } from "@mui/material"
import React from "react"

type CopyToClipboardProps = {
  value: string
}

export function CopyToClipboard(props: CopyToClipboardProps) {
  const { value } = props

  const [copied, setCopied] = React.useState(false)

  if (!value) return null

  return (
    <Tooltip title={copied ? "Copied" : "Copy to clipboard"}>
      <Box
        sx={{
          marginLeft: 1,
          cursor: "pointer",
          display: "inline-block",
          "&:hover": { fill: "var(--mui-palette-text-primary)" },
        }}
        onClick={(event) => {
          event.stopPropagation()
          navigator.clipboard.writeText(value)

          setCopied(true)

          setTimeout(() => {
            setCopied(false)
          }, 1000)
        }}
      >
        {copied ? (
          <CheckSharp sx={{ width: 14, height: 14, fill: "inherit" }} />
        ) : (
          <ContentCopySharp sx={{ width: 14, height: 14, fill: "inherit" }} />
        )}
      </Box>
    </Tooltip>
  )
}
