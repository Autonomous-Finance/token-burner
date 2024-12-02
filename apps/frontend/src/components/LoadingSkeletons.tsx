import { Skeleton, Stack } from "@mui/material"
import React from "react"

export function LoadingSkeletons() {
  return (
    <Stack>
      <Skeleton width={160} sx={{ display: "inline-block" }} />
      <Skeleton width={160} sx={{ display: "inline-block" }} />
      <Skeleton width={160} sx={{ display: "inline-block" }} />
      <Skeleton width={160} sx={{ display: "inline-block" }} />
    </Stack>
  )
}
