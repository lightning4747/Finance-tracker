import type {
  Transaction,
  Tag,
  ConsentResponse,
  SpendByTag,
  MonthlySummary,
  OverviewSummary
} from "./types"

const API_BASE = "http://localhost:4000/api"

/**
 * Helper to perform fetch requests with error handling
 */
async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorMessage = "An error occurred during the API request"
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // JSON parsing failed, use status text
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    return response.json() as Promise<T>
  } catch (err: any) {
    if (err.message === "Failed to fetch" || err.name === "TypeError") {
      throw new Error("Cannot connect to the backend server. Please verify the server is running on http://localhost:4000.")
    }
    throw err
  }
}

export const api = {
  // --- Transactions ---
  
  /**
   * Fetch all transactions matching filter parameters
   */
  async getTransactions(filters?: {
    startDate?: string
    endDate?: string
    type?: "DEBIT" | "CREDIT"
    tag?: string
    isOutlier?: boolean
  }): Promise<Transaction[]> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      if (filters.type) params.append("type", filters.type)
      if (filters.tag) params.append("tag", filters.tag)
      if (filters.isOutlier !== undefined) params.append("isOutlier", String(filters.isOutlier))
    }
    const query = params.toString()
    return apiRequest<Transaction[]>(`/transactions${query ? `?${query}` : ""}`)
  },

  /**
   * Fetch untagged transactions (empty tags array)
   */
  async getUntaggedTransactions(): Promise<Transaction[]> {
    return apiRequest<Transaction[]>("/transactions/untagged")
  },

  /**
   * Update transaction tags
   */
  async updateTransactionTags(id: string, tags: string[]): Promise<Transaction> {
    return apiRequest<Transaction>(`/transactions/${id}/tags`, {
      method: "PATCH",
      body: JSON.stringify({ tags }),
    })
  },

  /**
   * Toggle outlier status on a transaction
   */
  async toggleTransactionOutlier(id: string, isOutlier: boolean): Promise<Transaction> {
    return apiRequest<Transaction>(`/transactions/${id}/outlier`, {
      method: "PATCH",
      body: JSON.stringify({ isOutlier }),
    })
  },

  // --- Tags ---

  /**
   * Fetch all tags
   */
  async getTags(): Promise<Tag[]> {
    return apiRequest<Tag[]>("/tags")
  },

  /**
   * Create a new custom tag
   */
  async createTag(name: string, color?: string): Promise<Tag> {
    return apiRequest<Tag>("/tags", {
      method: "POST",
      body: JSON.stringify({ name, color }),
    })
  },

  /**
   * Delete tag by ID
   */
  async deleteTag(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/tags/${id}`, {
      method: "DELETE",
    })
  },

  // --- Setu AA Integration ---

  /**
   * Initiate consent flow for a VUA
   */
  async createConsent(vua: string): Promise<ConsentResponse> {
    return apiRequest<ConsentResponse>("/setu/consent", {
      method: "POST",
      body: JSON.stringify({ vua }),
    })
  },

  /**
   * Check consent approval status
   */
  async getConsentStatus(id: string): Promise<{ id: string; status: string }> {
    return apiRequest<{ id: string; status: string }>(`/setu/consent/${id}`)
  },

  /**
   * Manually trigger data session and fetch transactions
   */
  async triggerFetch(consentId: string): Promise<{ session: { id: string }; data: any; insertedTransactionsCount?: number; accountsProcessed?: number }> {
    return apiRequest<{ session: { id: string }; data: any; insertedTransactionsCount?: number; accountsProcessed?: number }>("/setu/fetch", {
      method: "POST",
      body: JSON.stringify({ consentId }),
    })
  },

  // --- Analytics ---

  /**
   * Get total spend grouped by tags (excludes outliers by default)
   */
  async getSpendByTag(filters?: { includeOutliers?: boolean; startDate?: string; endDate?: string }): Promise<SpendByTag[]> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.includeOutliers) params.append("includeOutliers", "true")
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
    }
    const query = params.toString()
    return apiRequest<SpendByTag[]>(`/analytics/by-tag${query ? `?${query}` : ""}`)
  },

  /**
   * Get monthly spend and income summaries (excludes outliers by default)
   */
  async getMonthlySummary(filters?: { includeOutliers?: boolean; startDate?: string; endDate?: string }): Promise<MonthlySummary[]> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.includeOutliers) params.append("includeOutliers", "true")
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
    }
    const query = params.toString()
    return apiRequest<MonthlySummary[]>(`/analytics/monthly${query ? `?${query}` : ""}`)
  },

  /**
   * Get overall stats overview (excludes outliers by default)
   */
  async getOverview(filters?: { includeOutliers?: boolean; startDate?: string; endDate?: string }): Promise<OverviewSummary> {
    const params = new URLSearchParams()
    if (filters) {
      if (filters.includeOutliers) params.append("includeOutliers", "true")
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
    }
    const query = params.toString()
    return apiRequest<OverviewSummary>(`/analytics/overview${query ? `?${query}` : ""}`)
  }
}
