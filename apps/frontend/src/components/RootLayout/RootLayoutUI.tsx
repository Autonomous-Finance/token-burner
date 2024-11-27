"use client"

import { Container } from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles"

import { PropsWithChildren } from "react"

import { ArweaveProvider } from "./ArweaveProvider"
import Header from "./Header"
import { theme } from "./theme"

export default function RootLayoutUI({ children }: PropsWithChildren) {
  return (
    <>
      <CssVarsProvider
        theme={theme}
        defaultMode="dark"
        defaultColorScheme={"dark"}
        modeStorageKey={"agent-v2-mode"}
      >
        <CssBaseline />
        <ArweaveProvider>
          <Header />
          <Container maxWidth="md" sx={{ minHeight: "calc(100vh - 177px)", paddingY: 3 }}>
            {children}
          </Container>
        </ArweaveProvider>
      </CssVarsProvider>
    </>
  )
}
