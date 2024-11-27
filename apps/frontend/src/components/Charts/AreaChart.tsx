"use client"

import { Skeleton } from "@mui/material"

import { Highchart, HighchartOptions } from "./Highchart"
import { createOptionsForStat } from "../../components/Charts/defaultOptions"

import { HighchartAreaData } from "../../types"

type AreaChartProps = {
  data: HighchartAreaData[]
  titleText?: string
  overrideValue?: number
}

export const AreaChart = ({ data, titleText, overrideValue }: AreaChartProps) => {
  const options: HighchartOptions = createOptionsForStat(
    titleText,
    150,
    undefined,
    data,
    overrideValue,
  )

  if (data.length === 0) return <Skeleton variant="rounded" height={150} />

  return <Highchart options={options} />
}
