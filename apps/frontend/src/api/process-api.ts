import { dryrun } from "./ao-connection"
import { isAddress } from "../utils/utils"

export async function measureLatency(processId: string): Promise<[number, number]> {
  if (!isAddress(processId)) {
    throw new Error("Invalid processId")
  }

  const start = Date.now()
  const result = await dryrun({
    process: processId,
    data: "",
    tags: [{ name: "Action", value: "Info" }],
  })
  const end = Date.now()

  // console.log("📜 LOG > measureLatency > result:", result)
  // console.log("📜 LOG > measureLatency > end:", end)

  const delta = end - start

  return [start, delta]
}
