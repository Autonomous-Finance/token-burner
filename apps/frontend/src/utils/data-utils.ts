export const truncateId = (text: string) => {
  if (!text || text.length <= 16) return text
  return text.slice(0, 5) + "..." + text.slice(-5)
}
