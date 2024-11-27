import {
  Client,
  //  cacheExchange,
  fetchExchange,
} from "urql"

export const goldsky = new Client({
  url: "https://arweave-search.goldsky.com/graphql",
  exchanges: [fetchExchange], //cacheExchange,
})

// export const arweaveNet = new Client({
//   url: "https://arweave.net/graphql",
//   exchanges: [cacheExchange, fetchExchange],
// })

export const AO_MIN_INGESTED_AT = "ingested_at: { min: 1728982676 }"
