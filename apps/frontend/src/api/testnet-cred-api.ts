import { dryrun } from "./ao-connection"

export const CRED_ADDR = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"

export async function readBalance(userAddr: string) {
  const result = await dryrun({
    process: CRED_ADDR,
    data: "",
    tags: [
      { name: "Action", value: "Balance" },
      { name: "Recipient", value: userAddr },
    ],
  })

  try {
    if (result.Messages.length === 0) throw new Error("No response from (get) Balance (ao-cred)")
    const balance = parseFloat(result.Messages[0].Data)
    return balance
  } catch (err) {
    console.error(err)
  }

  return 0
}
