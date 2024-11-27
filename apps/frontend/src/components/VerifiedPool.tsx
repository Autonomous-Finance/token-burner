import { Verified } from "@mui/icons-material"
import Tooltip from "@mui/material/Tooltip/Tooltip"

import type { Pool } from "../api/pools-api"
import { usePoolVerified } from "../hooks/usePoolVerified"

export default function VerifiedPool({ pool }: { pool: Pool }) {
  const poolVerified = usePoolVerified(pool)

  if (!poolVerified) return null

  if (poolVerified.verified)
    return (
      <Tooltip
        placement="left"
        title="Tokens in this pair are using the Ownership Renouncement pattern."
      >
        <Verified color="success" />
      </Tooltip>
    )

  return null
}
