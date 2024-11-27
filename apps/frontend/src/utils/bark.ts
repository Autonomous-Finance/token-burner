import { createDataItemSigner, message } from "@permaweb/aoconnect"

import type { Tag } from "@/types"

interface TransferParams {
  token: string
  quantity: bigint
  recipient: string
  tags?: Tag[]
}

export interface SwapParams {
  /** Input qty */
  input: bigint
  /** Expected output */
  minOutput: bigint
  /** Input token */
  token: string
  /** Pool process */
  pool: string
}

/**
 * Token transfer function
 */
export async function transfer(
  data: TransferParams,
  signer: ReturnType<typeof createDataItemSigner>,
) {
  // execute the transfer
  return await message({
    process: data.token,
    signer,
    tags: [
      { name: "Action", value: "Transfer" },
      { name: "Recipient", value: data.recipient },
      { name: "Quantity", value: data.quantity.toString() },
      ...(data.tags || []),
    ],
  })
}

/**
 * Execute swap
 */
export async function swap(data: SwapParams) {
  // swap message tags
  const swapTags = [
    { name: "X-Action", value: "Swap" },
    { name: "X-Expected-Min-Output", value: data.minOutput.toString() },
  ]

  // transfer the tokens and add forwarded tags
  // to let the process know about the order
  const transferID = await transfer(
    {
      token: data.token,
      recipient: data.pool,
      quantity: data.input,
      tags: swapTags,
    },
    createDataItemSigner(window.arweaveWallet),
  )

  return transferID
}
