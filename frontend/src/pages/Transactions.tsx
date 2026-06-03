import { useState } from "react"
import { useTransactions } from "../hooks/useTransactions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tag as TagIcon, Plus, Check, RefreshCw, X, AlertTriangle } from "lucide-react"

export default function Transactions() {
  const {
    transactions,
    tags,
    loading,
    error,
    filterType,
    setFilterType,
    filterOutlier,
    setFilterOutlier,
    filterTag,
    setFilterTag,
    dateRange,
    setDateRange,
    refresh,
    toggleOutlier,
    updateTags,
    bulkAssignTags,
  } = useTransactions()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkTags, setBulkTags] = useState<string[]>([])
  const [isBulkOpen, setIsBulkOpen] = useState(false)

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(transactions.map((tx) => tx.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const handleBulkApply = async () => {
    await bulkAssignTags(selectedIds, bulkTags)
    setSelectedIds([])
    setBulkTags([])
    setIsBulkOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400">View, organize, and classify all your retrieved bank statements.</p>
        </div>
        <Button onClick={refresh} disabled={loading} size="sm" variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="grid gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Date Range Start */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Start Date</Label>
            <Input
              type="date"
              className="w-full text-xs h-9 rounded-xl"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            />
          </div>

          {/* Date Range End */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">End Date</Label>
            <Input
              type="date"
              className="w-full text-xs h-9 rounded-xl"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            />
          </div>

          {/* Transaction Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Flow Type</Label>
            <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
              <SelectTrigger className="w-full text-xs h-9 rounded-xl">
                <SelectValue placeholder="All Flows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Flows</SelectItem>
                <SelectItem value="DEBIT">Debits (Spending)</SelectItem>
                <SelectItem value="CREDIT">Credits (Income)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tag Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tag Classifier</Label>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-full text-xs h-9 rounded-xl">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Tags</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outliers */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Outlier Status</Label>
            <Select value={filterOutlier} onValueChange={(val: any) => setFilterOutlier(val)}>
              <SelectTrigger className="w-full text-xs h-9 rounded-xl">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Transactions</SelectItem>
                <SelectItem value="NORMAL">Normal Spend</SelectItem>
                <SelectItem value="OUTLIER">Outliers Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(dateRange.start || dateRange.end || filterType !== "ALL" || filterTag !== "ALL" || filterOutlier !== "ALL") && (
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDateRange({ start: "", end: "" })
                setFilterType("ALL")
                setFilterTag("ALL")
                setFilterOutlier("ALL")
              }}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-violet-500/10 border border-violet-500/20 dark:bg-violet-950/20 dark:border-violet-900/50 rounded-2xl">
          <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
            {selectedIds.length} transaction(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Popover open={isBulkOpen} onOpenChange={setIsBulkOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1">
                  <TagIcon className="h-3.5 w-3.5" />
                  Assign Tags
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 rounded-xl" align="end">
                <div className="space-y-2">
                  <p className="text-xs font-semibold px-2 py-1 text-slate-500">Select tags to apply:</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {tags.map((t) => {
                      const isSelected = bulkTags.includes(t.name)
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            if (isSelected) {
                              setBulkTags((prev) => prev.filter((name) => name !== t.name))
                            } else {
                              setBulkTags((prev) => [...prev, t.name])
                            }
                          }}
                          className="flex items-center justify-between w-full px-2 py-1.5 text-xs text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: t.color }}
                            />
                            <span>{t.name}</span>
                          </div>
                          {isSelected && <Check className="h-3 w-3 text-violet-600" />}
                        </button>
                      )
                    })}
                  </div>
                  <Button onClick={handleBulkApply} size="sm" className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs mt-2">
                    Apply to Selection
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Transactions table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={transactions.length > 0 && selectedIds.length === transactions.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                </TableHead>
                <TableHead className="w-28">Date</TableHead>
                <TableHead>Narration details</TableHead>
                <TableHead className="w-28 text-right">Amount</TableHead>
                <TableHead className="w-24 text-center">Outlier</TableHead>
                <TableHead className="w-60">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-violet-600" />
                      <span>Loading transactions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-slate-500 dark:text-slate-400">
                    No transactions found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => {
                  const isDebit = tx.type === "DEBIT"
                  const isSelected = selectedIds.includes(tx.id)

                  return (
                    <TableRow key={tx.id} className={`${tx.isOutlier ? "bg-amber-500/5 hover:bg-amber-500/10" : ""} ${isSelected ? "bg-violet-500/5" : ""}`}>
                      {/* Checkbox */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(e.target.checked, tx.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500"
                        />
                      </TableCell>

                      {/* Date & Time */}
                      <TableCell>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {formatDate(tx.timestamp)}
                        </div>
                        <div className="text-[10px] text-slate-400">{formatTime(tx.timestamp)}</div>
                      </TableCell>

                      {/* Narration Description */}
                      <TableCell className="max-w-md">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {isDebit ? tx.receiver || "Unknown Recipient" : tx.sender || "Unknown Sender"}
                        </div>
                        <div className="text-xs text-slate-400 truncate hover:text-clip" title={tx.narration}>
                          {tx.narration}
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-bold">
                        <span className={isDebit ? "text-slate-700 dark:text-slate-300" : "text-emerald-600 dark:text-emerald-400"}>
                          {isDebit ? "-" : "+"}
                          {formatCurrency(tx.amount)}
                        </span>
                      </TableCell>

                      {/* Outlier switch */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={tx.isOutlier}
                            onCheckedChange={() => toggleOutlier(tx.id, tx.isOutlier)}
                          />
                        </div>
                      </TableCell>

                      {/* Tag Editor Dropdown */}
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {tx.tags.map((tagName) => {
                            const matchingTag = tags.find((t) => t.name === tagName)
                            return (
                              <span
                                key={tagName}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white transition-opacity duration-200"
                                style={{ backgroundColor: matchingTag?.color || "#6b7280" }}
                              >
                                {tagName}
                                <button
                                  onClick={() => {
                                    const nextTags = tx.tags.filter((t) => t !== tagName)
                                    updateTags(tx.id, nextTags)
                                  }}
                                  className="hover:opacity-75"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </span>
                            )
                          })}

                          {/* Add Tag Popover */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 rounded-full border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-1.5 rounded-xl" align="start">
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {tags.length === 0 ? (
                                  <p className="text-[10px] text-slate-400 text-center py-2">
                                    No tags created yet.
                                  </p>
                                ) : (
                                  tags.map((tagItem) => {
                                    const hasTag = tx.tags.includes(tagItem.name)
                                    return (
                                      <button
                                        key={tagItem.id}
                                        onClick={() => {
                                          const nextTags = hasTag
                                            ? tx.tags.filter((t) => t !== tagItem.name)
                                            : [...tx.tags, tagItem.name]
                                          updateTags(tx.id, nextTags)
                                        }}
                                        className="flex items-center justify-between w-full px-2 py-1 text-xs text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: tagItem.color }}
                                          />
                                          <span>{tagItem.name}</span>
                                        </div>
                                        {hasTag && <Check className="h-3.5 w-3.5 text-violet-600" />}
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
