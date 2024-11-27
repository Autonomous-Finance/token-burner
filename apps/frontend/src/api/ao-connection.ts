import { connect } from "@permaweb/aoconnect"

const DEXI_CU_URL = "ENV.VITE_DEXI_CU_URL"

export const { dryrun: dryrunDexiCU } = connect({
  CU_URL: DEXI_CU_URL,
})

export const { dryrun } = connect({
  // CU_URL: DEXI_CU_URL,
})
