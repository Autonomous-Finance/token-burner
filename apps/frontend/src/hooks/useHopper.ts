import { useQuery } from "@tanstack/react-query"

import { getTokenPrice } from "../api/hopper-ai"

const useHopperPrice = (token: string | undefined, type: "usd" | "token" = "token") => {
  return useQuery({
    queryKey: ["Get-Token-Price", token],
    queryFn: () => getTokenPrice(token as string, type),
    enabled: !!token,
  })
}

export default useHopperPrice
