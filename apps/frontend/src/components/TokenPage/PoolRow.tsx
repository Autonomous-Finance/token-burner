import { Link, Stack, TableCell, TableRow, Typography } from "@mui/material"

import { SimpleNumberFormat } from "../SimpleNumberFormat"
import { TokenAvatar } from "../TokenAvatar"
import type { PoolOverview } from "@/api/monitor-api"
import type { Pool } from "@/api/pools-api"

import { useTokenInfo } from "@/hooks/useTokenInfo"

export default function PoolRow({ pool, overview }: { pool: Pool; overview: PoolOverview }) {
  const baseTokenInfo = useTokenInfo(pool.baseToken)
  const quoteTokenInfo = useTokenInfo(pool.quoteToken)
  if (!baseTokenInfo || !quoteTokenInfo) return null

  return (
    <TableRow key={pool.id}>
      <TableCell
        sx={{
          padding: 2,
        }}
      >
        <Link
          href={`/#/pool/${pool.id}`}
          sx={{
            textDecoration: "none",
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TokenAvatar tokenId={pool.baseToken} />
            <TokenAvatar tokenId={pool.quoteToken} />
            <span>
              <Typography component="span" variant="inherit" fontWeight={500}>
                {baseTokenInfo.ticker}
              </Typography>
              <Typography
                component="span"
                color="text.secondary"
                variant="inherit"
                fontWeight={300}
              >
                /{quoteTokenInfo.ticker}
              </Typography>
            </span>
          </Stack>
        </Link>
      </TableCell>
      <TableCell align="right">
        <SimpleNumberFormat amount={overview.totalVolume} />
      </TableCell>
      <TableCell align="right">
        <SimpleNumberFormat amount={overview.marketCap} needsParsing={false} />
      </TableCell>
    </TableRow>
  )
}
