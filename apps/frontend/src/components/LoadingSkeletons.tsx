import { Skeleton, Stack } from "@mui/material"
import React from "react"

export function LoadingSkeletons() {
  return (
    <Stack>
      <Skeleton height={40} />
      <Skeleton height={40} />
      <Skeleton height={40} />
      <Skeleton height={40} />
    </Stack>
  )
}
