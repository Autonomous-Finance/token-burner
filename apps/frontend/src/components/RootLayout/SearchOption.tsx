import { Box, MenuItem, Stack, Typography } from "@mui/material"
import React from "react"

import { useNavigate } from "react-router-dom"

import { Pool } from "../../api/pools-api"
import { useTokenInfo } from "../../hooks/useTokenInfo"
import { TokenAvatar } from "../TokenAvatar"

export function SearchOption(props: { pool: Pool; handleClose: () => void }) {
  const { pool, handleClose } = props
  const { baseToken, quoteToken, id } = pool

  const baseTokenInfo = useTokenInfo(baseToken)
  const quoteTokenInfo = useTokenInfo(quoteToken)
  const navigate = useNavigate()

  return (
    <>
      <MenuItem
        onClick={() => {
          handleClose()
          navigate(`/pool/${id}`)
        }}
      >
        <Stack sx={{ opacity: pool.status === "private" ? 0.35 : 1 }}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Stack direction="row" spacing={0.5} alignItems="center" flexGrow={1}>
              <TokenAvatar tokenId={baseToken} />
              <TokenAvatar tokenId={quoteToken} />
              <span>
                <Typography component="span" variant="inherit" fontWeight={500}>
                  {baseTokenInfo?.ticker}
                </Typography>
                <Typography
                  component="span"
                  color="text.secondary"
                  variant="inherit"
                  fontWeight={300}
                >
                  /{quoteTokenInfo?.ticker}
                </Typography>
              </span>
            </Stack>
            {/* <Box>
              <Typography variant="caption" color="text.secondary">
                <img src={BarkLogo} alt="bark logo" width="38px" />
              </Typography>
            </Box> */}
          </Stack>

          <Box>
            {pool.status === "private" && (
              <Typography variant="caption" color="text.secondary">
                not yet subscribed to DEXI
              </Typography>
            )}
          </Box>
        </Stack>
      </MenuItem>
    </>
  )
}
