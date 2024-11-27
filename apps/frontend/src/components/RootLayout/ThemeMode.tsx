import { DarkModeOutlined, LightModeOutlined, ComputerOutlined } from "@mui/icons-material"
import { Button, Tooltip, useColorScheme } from "@mui/material"
import React from "react"

export function ThemeMode() {
  const { mode = "dark", setMode } = useColorScheme()

  // Function to cycle through the theme modes
  const handleThemeToggle = () => {
    const nextMode = mode === "light" ? "dark" : mode === "dark" ? "system" : "light"
    setMode(nextMode)
  }

  // Determine the icon based on the current mode
  const themeIcon =
    mode === "light" ? (
      <LightModeOutlined />
    ) : mode === "dark" ? (
      <DarkModeOutlined />
    ) : (
      <ComputerOutlined />
    )

  // Determine the tooltip message based on the current mode
  const themeTooltip =
    mode === "light"
      ? "Switch to dark mode"
      : mode === "dark"
        ? "Switch to system mode"
        : "Switch to light mode"

  return (
    <Tooltip title={themeTooltip}>
      <Button
        // variant="outlined"
        color="secondary"
        onClick={handleThemeToggle}
        sx={{
          // alignSelf: "center",
          minWidth: 0,
        }}
      >
        {themeIcon}
      </Button>
    </Tooltip>
  )
}
