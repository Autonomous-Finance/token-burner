"use client"

import { Box, Tooltip, Link as MuiLink } from "@mui/material"
import React from "react"

import { Link } from "react-router-dom"

import { CopyToClipboard } from "./CopyToClipboard"

type IdBlockProps = {
  label: string
  value?: string
  href?: string
  hideCopyToClipboard?: boolean
}

export function IdBlock(props: IdBlockProps) {
  const { label, value, href, hideCopyToClipboard } = props

  const copyValue = value || label

  if (href) {
    return (
      <Box
        sx={{
          fill: "none",
          "&:hover": { fill: "var(--mui-palette-text-secondary)" },
        }}
      >
        <MuiLink
          target={href.startsWith("http") ? "_blank" : undefined}
          component={Link}
          to={href}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <Tooltip title={value}>
            <Box
              sx={{
                display: "inline-block",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {label}
            </Box>
          </Tooltip>
        </MuiLink>
        {!hideCopyToClipboard && <CopyToClipboard value={copyValue} />}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        fill: "none",
        "&:hover": { fill: "var(--mui-palette-text-secondary)" },
      }}
    >
      <Tooltip title={value}>
        <span>{label}</span>
      </Tooltip>
      {!hideCopyToClipboard && <CopyToClipboard value={copyValue} />}
    </Box>
  )
}
