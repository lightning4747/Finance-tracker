import { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api"
import type { Tag } from "../lib/types"

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getTags()
      setTags(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch tags")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const createTag = async (name: string, color?: string) => {
    setError(null)
    try {
      const newTag = await api.createTag(name, color)
      setTags((prev) => [...prev, newTag])
      return newTag
    } catch (err: any) {
      setError(err.message || "Failed to create tag")
      throw err;
    }
  }

  const deleteTag = async (id: string) => {
    setError(null)
    try {
      await api.deleteTag(id)
      setTags((prev) => prev.filter((tag) => tag.id !== id))
    } catch (err: any) {
      setError(err.message || "Failed to delete tag")
      throw err;
    }
  }

  return {
    tags,
    loading,
    error,
    refresh: fetchTags,
    createTag,
    deleteTag,
  }
}
