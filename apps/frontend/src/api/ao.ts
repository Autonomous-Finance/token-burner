import { connect } from "@permaweb/aoconnect"

/**
 * ao connect() instance
 */
export type AoInstance = ReturnType<typeof connect>

/**
 * Returned message object(s) from dryRun
 */
export interface Message {
  Anchor: string
  Tags: Tag[]
  Target: string
  Data: string
}

export type Tag = {
  name: string
  value: string
}
