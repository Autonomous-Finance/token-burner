// PoolContext.tsx
import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { getPoolById, type Pool } from "@/api/pools-api"

interface PoolContextType {
  pool: Pool
  setPool: React.Dispatch<React.SetStateAction<Pool>>
  isReversed: boolean
  reversePool: () => void
  loading: boolean
}

const PoolContext = createContext<PoolContextType | undefined>(undefined)

export const PoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pool, setPool] = useState<Pool | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const { poolId } = useParams<{ poolId: string }>()
  const [isReversed, setIsReversed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!poolId) {
      navigate("/pool-not-found")
      return
    }

    setLoading(true)

    getPoolById(poolId)
      .then((fetchedPool) => {
        if (fetchedPool) {
          setPool(fetchedPool)
        } else {
          navigate("/pool-not-found")
        }
      })
      .catch((error) => {
        console.error("Error fetching pool:", error)
        navigate("/pool-not-found")
      })
      .finally(() => setLoading(false))
  }, [poolId, navigate])

  // Don't render anything while loading or if pool is undefined
  if (loading || !pool) {
    return null
  }

  function reversePool() {
    if (!pool) return

    setIsReversed(!isReversed)
  }

  // At this point, pool is guaranteed to be defined
  return (
    <PoolContext.Provider
      value={{
        pool,
        setPool: setPool as React.Dispatch<React.SetStateAction<Pool>>,
        loading,
        isReversed,
        reversePool,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}

export const usePool = () => {
  const context = useContext(PoolContext)
  if (context === undefined) {
    throw new Error("usePool must be used within a PoolProvider")
  }
  return context
}
