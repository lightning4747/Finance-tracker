import { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api"
import type { OverviewSummary, SpendByTag, MonthlySummary } from "../lib/types"

export function useAnalytics() {
  const [includeOutliers, setIncludeOutliers] = useState(false)
  const [overview, setOverview] = useState<OverviewSummary | null>(null)
  const [spendByTag, setSpendByTag] = useState<SpendByTag[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewData, spendData, monthlyData] = await Promise.all([
        api.getOverview(includeOutliers),
        api.getSpendByTag(includeOutliers),
        api.getMonthlySummary(includeOutliers),
      ])
      setOverview(overviewData)
      setSpendByTag(spendData)
      setMonthlySummary(monthlyData)
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err.message)
      setError(err.message || "Failed to fetch analytics data")
    } finally {
      setLoading(false)
    }
  }, [includeOutliers])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    includeOutliers,
    setIncludeOutliers,
    overview,
    spendByTag,
    monthlySummary,
    loading,
    error,
    refresh: fetchAnalytics,
  }
}
