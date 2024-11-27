import { dryrun } from "@permaweb/aoconnect"

import ENV from "@/env"
import { NATIVE_TOKENS } from "@/settings"
import { Tag } from "@/types"

type TokenDetailsR = {
  TokenProcess: string
  InternalId: string
  Deployer: string
  Name: string
  Ticker: string
  Denomination: number
  Description: string
  Balances: Record<string, number>
  TotalSupply: number
  Telegram: string
  Twitter: string
  Website: string
  Logo: string
  Status: string
  LPs: Record<string, string>
  RenounceOwnership: string | boolean
}

export type TokenDetails = {
  TokenProcess: string
  InternalId: string
  Deployer: string
  Name: string
  Ticker: string
  Denomination: number
  Description: string
  Balances: Record<string, number>
  TotalSupply: number
  Logo: string
  Status: string
  LPs: Record<string, string>
  RenounceOwnership: boolean
  SocialLinks?: Record<string, string> | { key: string; value: string }[]
  CoverImage?: string
}

export async function getTokenDetails(tokenProcess: string): Promise<TokenDetails> {
  const isNative = NATIVE_TOKENS.find((token) => token.TokenProcess === tokenProcess)

  if (isNative) {
    // Get token Total-Supply
    const result2 = await dryrun({
      process: tokenProcess,
      tags: [{ name: "Action", value: "Total-Supply" }],
    })

    if (result2.Messages.length === 0) throw new Error("No response from Token-By-Process")

    const totalSupply = result2.Messages[0].Data

    return {
      ...isNative,
      InternalId: "external",
      TotalSupply: totalSupply ? Number(totalSupply) : 0,
    }
  }

  const result = await dryrun({
    process: ENV.VITE_TOKEN_FACTORY_PROCESS,
    tags: [
      { name: "Action", value: "Token-By-Process" },
      { name: "TokenProcess", value: tokenProcess },
    ],
  })

  if (result.Messages.length === 0) throw new Error("No response from Token-By-Process")

  const data = result.Messages[0].Data

  // Check if it's an external token
  if (data === "[]") {
    // Get token info
    const result = await dryrun({
      process: tokenProcess,
      tags: [{ name: "Action", value: "Info" }],
    })

    if (result.Messages.length === 0) throw new Error("No response from Token-By-Process")

    const ticker = result.Messages[0].Tags.find((tag: Tag) => tag.name === "Ticker")?.value
    const name = result.Messages[0].Tags.find((tag: Tag) => tag.name === "Name")?.value
    const denomination = result.Messages[0].Tags.find(
      (tag: Tag) => tag.name === "Denomination",
    )?.value
    const logo = result.Messages[0].Tags.find((tag: Tag) => tag.name === "Logo")?.value

    // Get token Total-Supply
    const result2 = await dryrun({
      process: tokenProcess,
      tags: [{ name: "Action", value: "Total-Supply" }],
    })

    if (result2.Messages.length === 0) throw new Error("No response from Token-By-Process")

    const totalSupply = result2.Messages[0].Data

    return {
      TokenProcess: tokenProcess,
      InternalId: "external",
      Deployer: "",
      Name: name ?? "",
      Ticker: ticker ?? "",
      Denomination: denomination ? Number(denomination) : 0,
      Description: "",
      Balances: {},
      TotalSupply: totalSupply ? Number(totalSupply) : 0,
      Logo: logo,
      Status: "EXTERNAL",
      LPs: {},
      RenounceOwnership: false,
    }
  }

  if (!data) throw new Error("Response malformed")

  const tokenDetailsR: TokenDetailsR = JSON.parse(data)

  return {
    ...tokenDetailsR,
    RenounceOwnership:
      typeof tokenDetailsR.RenounceOwnership === "string"
        ? tokenDetailsR.RenounceOwnership === "true"
        : tokenDetailsR.RenounceOwnership,
  }
}
