import numbro from "numbro"

export function formatNumber(number: number, options: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat(undefined, options).format(number)
}

export function formatNumberWithNumbro(number: string | number, mantissa = 4, totalLength = 0) {
  return numbro(number).format({
    thousandSeparated: true,
    mantissa: mantissa,
    trimMantissa: true,
    totalLength: totalLength,
  })
}
