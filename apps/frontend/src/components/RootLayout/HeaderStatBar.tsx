import { Paper, Skeleton, Stack, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import { useEffect, useMemo } from "react"

import { type PoolOverview, getOverview } from "../../api/monitor-api"
import { getNativeArPrice } from "../../api/price-oracle-api"
import { $arPrice } from "../../stores/currency-store"
import { $poolsOverviewMap } from "../../stores/pools-store"
import { SimpleNumberFormat } from "../SimpleNumberFormat"
import { UsdAmountBlock } from "../UsdAmountBlock"

export function HeaderStatBar() {
  const poolsOverviewMap = useStore($poolsOverviewMap)

  useEffect(() => {
    getNativeArPrice()
      .then($arPrice.set)
      .catch((err) => {
        console.error(err)
        $arPrice.set(null)
      })
    getOverview().then((overview) => {
      const map = overview.reduce(
        (acc, overview) => ({
          ...acc,
          [overview.poolId]: overview,
        }),
        {} as Record<string, PoolOverview>,
      )

      $poolsOverviewMap.set(map)
    })
  }, [])

  const totalVolume = useMemo(
    () =>
      poolsOverviewMap === null
        ? null
        : Object.values(poolsOverviewMap).reduce((acc, overview) => {
            if (overview === undefined) return acc

            return acc + overview.totalVolume
          }, 0),
    [poolsOverviewMap],
  )

  const totalTransactions = useMemo(
    () =>
      poolsOverviewMap === null
        ? null
        : Object.values(poolsOverviewMap).reduce((acc, overview) => {
            if (overview === undefined) return acc

            return acc + overview.transactions
          }, 0),
    [poolsOverviewMap],
  )
  const arPrice = useStore($arPrice) || undefined

  return (
    <Paper
      sx={{
        paddingX: 3,
        // paddingY: 1.2,
        textTransform: "uppercase",
      }}
      variant="outlined"
      elevation={0}
      component={Stack}
      direction="row"
      alignItems="center"
      gap={4}
    >
      <Typography variant="caption">
        <Typography variant="caption" color="text.secondary">
          {/* {nativeTokenInfo.ticker}: */} AR:
        </Typography>{" "}
        <UsdAmountBlock amount={1} quoteTokenUsdPrice={arPrice} />
      </Typography>
      <Typography variant="caption">
        <Typography variant="caption" color="text.secondary">
          24h Volume:
        </Typography>{" "}
        {totalVolume === null ? (
          <Skeleton width={80} component="span" sx={{ display: "inline-flex" }} />
        ) : (
          <SimpleNumberFormat amount={totalVolume} quoteTokenUsdPrice={arPrice} />
        )}
      </Typography>
      <Typography variant="caption">
        <Typography variant="caption" color="text.secondary">
          24h Txns:
        </Typography>{" "}
        {totalTransactions === null ? (
          <Skeleton width={80} component="span" sx={{ display: "inline-flex" }} />
        ) : (
          <span>{totalTransactions}</span>
        )}
      </Typography>
    </Paper>
  )
}
