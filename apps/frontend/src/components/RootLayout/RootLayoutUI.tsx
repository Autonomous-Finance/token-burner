"use client"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles"

import { PropsWithChildren } from "react"

import { ArweaveProvider } from "./ArweaveProvider"
import Header from "./Header"
import { theme } from "./theme"
import { IdBlock } from "../IdBlock"
import TOKENBURNER from "@/constants/TokenBurner_process"

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
            <Stack alignItems="center" mb={10}>
              <Typography variant="subtitle1" gutterBottom>
                Welcome to the AO Token Burn Page
              </Typography>
              <Typography variant="caption" gutterBottom>
                where you can permanently remove tokens from circulation.
              </Typography>
            </Stack>

            {children}

            <Accordion sx={{ mt: 20 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Q: Why burn tokens?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" component="div">
                  <Typography variant="body1">
                    <strong>A:</strong>
                  </Typography>
                  <ul>
                    <li>
                      <strong>Increase Token Scarcity:</strong> Burning reduces the circulating
                      supply, which can potentially boost token value.
                    </li>
                    <li>
                      <strong>Reliable Supply Reduction:</strong> Permanently removes tokens from
                      circulation in a verifiable way.
                    </li>
                    <li>
                      <strong>For Fun or Symbolism:</strong> Sometimes, it’s just about making a
                      statement or marking an occasion.
                    </li>
                  </ul>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Q: How do I burn tokens?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" component="div">
                  <Typography variant="body1">
                    <strong>A:</strong>
                  </Typography>
                  <ol>
                    <li>
                      <strong>Through the Interface:</strong>
                      <ul>
                        <li>Connect your wallet.</li>
                        <li>
                          Select the token from the dropdown or paste the token’s contract address.
                        </li>
                        <li>
                          Click <strong>Burn</strong>.
                        </li>
                        <li>Wuala! Your tokens are permanently sent to the burn address.</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Manually:</strong>
                      <Typography variant="inherit" paragraph>
                        Send your tokens directly to the burn address:
                      </Typography>
                      <IdBlock
                        label="0000000000000000000000000000000000000000000"
                        value="0000000000000000000000000000000000000000000"
                      />
                      <Typography variant="caption" color="textSecondary" paragraph>
                        (43 zeroes)
                      </Typography>
                      <Typography variant="inherit" paragraph>
                        This address is universally recognized as the "black hole" for token burns —
                        tokens sent here are unrecoverable, ensuring their removal from circulation.
                      </Typography>
                    </li>
                  </ol>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  Q: How do I query which tokens have been burned?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" component="div">
                  <Typography variant="body1">
                    <strong>A:</strong>
                  </Typography>
                  <ul>
                    <li>
                      <strong>In the Interface:</strong>
                      <ul>
                        <li>
                          Select a token or paste its contract address to view the burn history.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Programmatically:</strong>
                      <ul>
                        <li>
                          <Stack direction="row" gap={1}>
                            Process ID: <IdBlock label={TOKENBURNER} value={TOKENBURNER} />
                          </Stack>
                        </li>
                      </ul>
                      <Typography variant="body1" paragraph mt={2}>
                        Use the following methods to query burn data:
                      </Typography>
                      <ol>
                        <li>
                          <Typography variant="body1">
                            <strong>Burned Balance per User</strong>
                          </Typography>
                          <ul>
                            <li>
                              <strong>Action:</strong>{" "}
                              <Typography color="accent.main" variant="caption">
                                getBurnedBalance
                              </Typography>
                            </li>
                            <li>
                              <strong>Data Retrieved:</strong> Total amount of a specific token that
                              a user has burned.
                            </li>
                          </ul>
                        </li>
                        <li>
                          <Typography variant="body1">
                            <strong>Burn History for a Token</strong>
                          </Typography>
                          <ul>
                            <li>
                              <strong>Action:</strong>{" "}
                              <Typography color="accent.main" variant="caption">
                                Get-Burns
                              </Typography>
                            </li>
                            <li>
                              <strong>Data Retrieved:</strong> Detailed burn history for a specific
                              token, including amounts and users.
                            </li>
                          </ul>
                        </li>
                        <li>
                          <Typography variant="body1">
                            <strong>LP Token Burn History</strong>
                          </Typography>
                          <ul>
                            <li>
                              <strong>Action:</strong>{" "}
                              <Typography color="accent.main" variant="caption">
                                Get-LP-Burn-History
                              </Typography>
                            </li>
                            <li>
                              <strong>Data Retrieved:</strong> Burn history for all Liquidity Pool
                              (LP) tokens associated with a specific token.
                            </li>
                          </ul>
                        </li>
                        <li>
                          <Typography variant="body1">
                            <strong>Total Burned Amount for a Token</strong>
                          </Typography>
                          <ul>
                            <li>
                              <strong>Action:</strong>{" "}
                              <Typography color="accent.main" variant="caption">
                                Get-Total-Burned-Amount
                              </Typography>
                            </li>
                            <li>
                              <strong>Data Retrieved:</strong> Total amount of a specific token that
                              has been burned by all users.
                            </li>
                          </ul>
                        </li>
                        <li>
                          <Typography variant="body1">
                            <strong>Overall Burn Statistics</strong>
                          </Typography>
                          <ul>
                            <li>
                              <strong>Action:</strong>{" "}
                              <Typography color="accent.main" variant="caption">
                                Info
                              </Typography>
                            </li>
                            <li>
                              <strong>Data Retrieved:</strong> Aggregate statistics such as total
                              burn events and total amount burned across all tokens.
                            </li>
                          </ul>
                        </li>
                      </ol>
                    </li>
                  </ul>
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Container>
        </ArweaveProvider>
      </CssVarsProvider>
    </>
  )
}
