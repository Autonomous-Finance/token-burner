// THIS FILE IS COPIED FROM `bark-interface` REPOSITORY !!
import dayjs, { ManipulateType } from "dayjs"

import relativeTime from "dayjs/plugin/relativeTime"

import { FORMAT_DECIMALS } from "../settings"

dayjs.extend(relativeTime)

/**
 * Format addresses
 *
 * @param address Address to format
 */
export function formatAddress(address: string, count = 13) {
  return (
    address.substring(0, count) + "..." + address.substring(address.length - count, address.length)
  )
}

/**
 * Returns if this is a valid arweave address
 */
export const isAddress = (addr: string) => /[a-z0-9_-]{43}/i.test(addr)

/**
 * Parse gateway from URL
 */
export function parseGateway(url: string) {
  const urlObj = new URL(url)

  return {
    host: urlObj.host,
    port: urlObj.port ? parseFloat(urlObj.port) : 443,
    protocol: urlObj.protocol.replace(":", "") as "http" | "https",
  }
}

export function formatNumber(
  number: number | string,
  options: Intl.NumberFormatOptions = {},
  locale?: string,
) {
  return new Intl.NumberFormat(locale, options).format(Number(number))
}

export function truncateNumberAuto(number?: number | string, decimals = FORMAT_DECIMALS) {
  if (number === 0 || number === "0" || !number) return "0"

  const value = Number(number)

  const longValue = value.toFixed(18)

  const delimiter = "."

  const smallValue = value < 1 && value > -1
  let firstNonZeroPos = longValue.indexOf(delimiter) + 1
  let leadingZeroes = 0
  while (longValue[firstNonZeroPos] === "0") {
    firstNonZeroPos++
    leadingZeroes++
  }
  let maxDecimals = leadingZeroes + 4

  if (maxDecimals > 18) maxDecimals = 18
  if (maxDecimals < decimals) maxDecimals = decimals

  const truncatedValue = smallValue ? value.toFixed(maxDecimals) : value.toFixed(decimals)
  return truncatedValue
}

export function formatNumberAuto(number?: number | string, decimals = FORMAT_DECIMALS) {
  if (number === 0 || number === "0" || !number) return "0"

  const value = Number(number)

  const longValue = formatNumber(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 18,
  })

  const delimiter = formatNumber(0.1).charAt(1)

  const smallValue = value < 1 && value > -1
  let firstNonZeroPos = longValue.indexOf(delimiter) + 1
  let leadingZeroes = 0
  while (longValue[firstNonZeroPos] === "0") {
    firstNonZeroPos++
    leadingZeroes++
  }
  let maxDecimals = leadingZeroes + 4

  if (maxDecimals > 18) maxDecimals = 18
  if (maxDecimals < decimals) maxDecimals = decimals

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: smallValue ? maxDecimals : decimals,
  }

  return formatNumber(truncateNumberAuto(value, decimals), options)
}

/**
 * Parse a bigint to a string containing a decimal number (float), based on a token denomination
 */
export function parseBigIntAsNumber(
  value?: bigint | string,
  denomination = 0,
  maximumFractionDigits = denomination,
) {
  try {
    if (!value) return "0"

    // handle negative values by capturing the sign
    const isNegative = value.toString().startsWith("-")
    const absValue = isNegative
      ? (typeof value === "string" ? BigInt(value) : value) * -1n
      : typeof value === "string"
        ? BigInt(value)
        : value

    // multiplier according to the denomination
    const dMul = 10n ** BigInt(denomination)

    // fractional and integer parts
    const integerPart = absValue / dMul

    // return value
    let result = integerPart.toString()

    // add fractions
    if (maximumFractionDigits !== 0) {
      // starting index of the fractional part
      const fractionalPartStart = integerPart !== 0n ? integerPart.toString().length : 0

      // calculate fractional part
      let fractions = absValue
        .toString()
        .slice(fractionalPartStart)
        .padStart(Number(denomination), "0")
        .slice(0, maximumFractionDigits)

      if (fractions !== "" && BigInt(fractions) > 0n) {
        result += "." + fractions.replace(/0*$/, "")
      }
    }

    // reapply the negative sign if necessary
    if (isNegative) result = "-" + result

    return result
  } catch (error) {
    console.error(
      "Cannot parse BigInt as number",
      value,
      denomination,
      maximumFractionDigits,
      error,
    )
    return "0"
  }
}

/**
 * Parse a string containing a decimal number (float) to a bigint, based on a token denomination
 */
export function parseNumberAsBigInt(number?: string, denomination = 0) {
  // this is to support numbers with this notation 4.3311482723360494e-7
  let value = number?.includes("e") ? Number(number).toFixed(denomination) : number
  if (!value) return 0n
  // multiplier according to the denomination
  const dMul = 10n ** BigInt(denomination)

  // replace formatters
  value = value.replace(/,/g, "")

  // empty value
  if (value === "") return 0n

  let result = BigInt(value.split(".")[0]) * dMul
  const plainFractions = value.split(".")[1]

  if (plainFractions && plainFractions !== "") {
    // select part that is max. as long as the denomination
    // the other part is discarded
    const relevantPart = plainFractions.slice(0, Number(denomination))
    let fractionalPart = BigInt(relevantPart)

    // fill to match denomination
    if (BigInt(relevantPart.length) < denomination) {
      fractionalPart = fractionalPart * 10n ** (BigInt(denomination) - BigInt(relevantPart.length))
    }

    result += fractionalPart
  }

  return result
}

/**
 * Format tickers
 */
export function formatTicker(ticker?: string) {
  if (!ticker) ticker = ""

  ticker = ticker.replace("Botega LP ", "")

  if (ticker.includes("/")) {
    const index = ticker.indexOf("/")
    const first = ticker.slice(0, index)
    const second = ticker.slice(index + 1)
    return `$${first}/$${second}`
  }

  return `$${ticker}`
}

const decimalRegexp = /^\d*(?:[.])?\d*$/
export const decimalEnforcer = (nextUserInput: string) => {
  if (nextUserInput === "") {
    return ""
  } else if (nextUserInput === ".") {
    return "0."
  } else if (decimalRegexp.test(nextUserInput)) {
    return nextUserInput
  }
  return ""
}

const integerRegexp = /^\d*$/
export const integerEnforcer = (nextUserInput: string) => {
  if (nextUserInput === "") {
    return ""
  } else if (integerRegexp.test(nextUserInput)) {
    return nextUserInput
  }
  return ""
}

export function formatRelative(date: Date | number) {
  if (!date) return

  const distance = dayjs().to(dayjs(date))
  return distance
}

export function formatFullDate(date: Date | number) {
  if (!date) return

  const formattedDate = dayjs(date).format("YYYY-MM-DD HH:mm")
  return formattedDate
}

export function formatFullDateFromMinutes(runningTime?: number) {
  if (!runningTime) return ""
  return dayjs().add(runningTime, "minute").format("YYYY-MM-DD HH:mm")
}

export function formatDuration(runningTime?: number, unit: ManipulateType = "minute") {
  if (!runningTime) return ""
  return dayjs().add(runningTime, unit).fromNow(true)
}
