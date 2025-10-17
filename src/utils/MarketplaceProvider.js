import React, { createContext, useContext, useEffect, useState } from "react"
import { fetchMarketplaceList } from "./marketplace"

const MarketplaceContext = createContext()

export const MarketplaceProvider = ({ userId, children }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketplaceList(userId, "MarketplaceProvider")
        setCategories(data)
      } catch (err) {
        console.error("Error loading marketplace data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [userId])

  return (
    <MarketplaceContext.Provider value={{ categories, loading }}>
      {children}
    </MarketplaceContext.Provider>
  )
}

export const useMarketplace = () => useContext(MarketplaceContext)
