import { useQuery } from "@tanstack/react-query"

import { getTokenDetails } from "../api/tokendrop-api"

const useTokenDetails = (token: string | undefined) => {
  return useQuery({
    queryKey: ["tokenDetails", token],
    queryFn: () => getTokenDetails(token as string),
    enabled: !!token,
  })
}

export default useTokenDetails
