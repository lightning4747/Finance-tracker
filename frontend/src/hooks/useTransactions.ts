import { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api"
import type { Transaction, Tag } from "../lib/types"

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [filterType, setFilterType] = useState<"ALL" | "DEBIT" | "CREDIT">("ALL")
  const [filterOutlier, setFilterOutlier] = useState<"ALL" | "OUTLIER" | "NORMAL">("ALL")
  const [filterTag, setFilterTag] = useState<string>("ALL")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })

  const fetchTags = useCallback(async () => {
    try {
      const allTags = await api.getTags()
      setTags(allTags)
    } catch (err: any) {
      console.error("Failed to fetch tags in hook:", err.message)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const typeParam = filterType === "ALL" ? undefined : filterType
      const outlierParam = filterOutlier === "ALL" ? undefined : (filterOutlier === "OUTLIER")
      const tagParam = filterTag === "ALL" ? undefined : filterTag
      const startParam = dateRange.start || undefined
      const endParam = dateRange.end || undefined

      const data = await api.getTransactions({
        startDate: startParam,
        endDate: endParam,
        type: typeParam,
        tag: tagParam,
        isOutlier: outlierParam,
      })
      setTransactions(data)
    } catch (err: any) {
      setError(err.message || "Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [filterType, filterOutlier, filterTag, dateRange])

  // Initial loads
  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const toggleOutlier = async (id: string, currentVal: boolean) => {
    try {
      const updated = await api.toggleTransactionOutlier(id, !currentVal)
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, isOutlier: updated.isOutlier } : tx))
      )
    } catch (err: any) {
      setError(err.message || "Failed to update outlier status")
    }
  }

  const updateTags = async (id: string, selectedTags: string[]) => {
    try {
      const updated = await api.updateTransactionTags(id, selectedTags)
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, tags: updated.tags } : tx))
      )
    } catch (err: any) {
      setError(err.message || "Failed to update transaction tags")
    }
  }

  const bulkAssignTags = async (ids: string[], selectedTags: string[]) => {
    try {
      await Promise.all(ids.map((id) => api.updateTransactionTags(id, selectedTags)))
      // Re-fetch to synchronize state
      await fetchTransactions()
    } catch (err: any) {
      setError(err.message || "Failed bulk tag assignment")
    }
  }

  return {
    transactions,
    tags,
    loading,
    error,
    // Filters
    filterType,
    setFilterType,
    filterOutlier,
    setFilterOutlier,
    filterTag,
    setFilterTag,
    dateRange,
    setDateRange,
    // Actions
    refresh: fetchTransactions,
    refreshTags: fetchTags,
    toggleOutlier,
    updateTags,
    bulkAssignTags,
  }
}
