import { gql } from "urql"

import { AoMessage, TransactionEdge } from "../types"

export const messageFields = gql`
  fragment MessageFields on TransactionConnection {
    edges {
      cursor
      node {
        id
        ingested_at
        recipient
        block {
          timestamp
          height
        }
        tags {
          name
          value
        }
        data {
          size
        }
        owner {
          address
        }
      }
    }
  }
`

export const systemTagNames = [
  "Type",
  "Data-Protocol",
  "SDK",
  "Content-Type",
  "Variant",
  "Pushed-For",
  "Ref_",
  "Reference",
  "From-Module",
  "From-Process",
  "Module",
  "Scheduler",
  "aos-Version",
  "App-Name",
  "Scheduler",
  "Name",
]

export function parseAoMessage(edge: TransactionEdge): AoMessage {
  const { node, cursor } = edge

  const systemTags: Record<string, string> = {}
  const userTags: Record<string, string> = {}
  const tags: Record<string, string> = {}

  node.tags.forEach((tag) => {
    tags[tag.name] = tag.value

    if (systemTagNames.includes(tag.name)) {
      systemTags[tag.name] = tag.value
    } else {
      userTags[tag.name] = tag.value
    }
  })

  // delete systemTags["Pushed-For"]
  // delete systemTags["Data-Protocol"]
  delete systemTags["Type"]
  delete systemTags["Module"]
  delete systemTags["Name"]

  const type = tags["Type"] as AoMessage["type"]
  const blockHeight = node.block ? node.block.height : null
  const from = tags["Forwarded-For"] || tags["From-Process"] || node.owner.address
  const schedulerId = tags["Scheduler"]
  const action = tags["Action"]
  const blockTimestamp = node.block ? new Date(node.block.timestamp * 1000) : null
  const ingestedAt = new Date(node.ingested_at * 1000)
  const to = node.recipient.trim()

  if (type === "Message" && tags["Name"]) {
    userTags["Name"] = tags["Name"]
  }

  return {
    id: node.id,
    type,
    from,
    to,
    blockHeight,
    schedulerId,
    blockTimestamp,
    ingestedAt,
    action,
    tags,
    systemTags,
    userTags,
    cursor,
    dataSize: node.data?.size,
  }
}
