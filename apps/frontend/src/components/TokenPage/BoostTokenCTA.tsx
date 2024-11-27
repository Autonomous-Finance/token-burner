import { AutoAwesome } from "@mui/icons-material"
import { Button, Paper, Stack, Typography } from "@mui/material"
import { Link, useParams } from "react-router-dom"

import { DEXI_UPDATE_TOKEN_DISCOUNT_PRICE, NATIVE_TOKENS } from "@/settings"

export default function BoostTokenCTA() {
  const { tokenId } = useParams()

  const isNativeToken = NATIVE_TOKENS.find((t) => t.TokenProcess === tokenId)

  if (isNativeToken) {
    return null
  }

  return (
    <Paper sx={{ padding: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-around">
        <Stack gap={1}>
          <Stack direction={"row"} gap={2} alignItems={"center"}>
            <AutoAwesome />
            <Typography variant="h6">Boost Token Visibility</Typography>
          </Stack>
          <Typography variant="body2">
            Update your token's metadata and watch your project soar!
          </Typography>
          <ul style={{ padding: 0, listStyle: "none" }}>
            <li className="flex items-center gap-1">
              <span className="text-green-400">✓</span> Increase credibility
            </li>
            <li className="flex items-center gap-1">
              <span className="text-green-400">✓</span> Attract more investors
            </li>
            <li className="flex items-center gap-1">
              <span className="text-green-400">✓</span> Improve discoverability
            </li>
          </ul>

          <Link to={`/token/${tokenId}/update-metadata`}>
            <Button variant="contained" sx={{ width: "100%" }}>
              Update for only {DEXI_UPDATE_TOKEN_DISCOUNT_PRICE} USD
            </Button>
          </Link>
        </Stack>
        {/* <img src={boostSVG} height="300px" alt="Boost your token" /> */}
      </Stack>
    </Paper>
  )
}
