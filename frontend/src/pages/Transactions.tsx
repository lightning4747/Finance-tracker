import { useState, useEffect, useCallback } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useTransactions } from "../hooks/useTransactions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { 
  Tag as TagIcon, 
  Plus, 
  Check, 
  RefreshCw, 
  X, 
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Info
} from "lucide-react"
import { api } from "../lib/api"
import type { Transaction } from "../lib/types"

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
    updateTags: hookUpdateTags,
    bulkAssignTags: hookBulkAssignTags,
  } = useTransactions()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkTags, setBulkTags] = useState<string[]>([])
  const [isBulkOpen, setIsBulkOpen] = useState(false)

  // Quick tag workflow state variables
  const [untaggedQueue, setUntaggedQueue] = useState<Transaction[]>([])
  const [isQuickTagOpen, setIsQuickTagOpen] = useState(false)
  const [quickTagIndex, setQuickTagIndex] = useState(0)
  const [isAllDone, setIsAllDone] = useState(false)

  // Fetch all global untagged transactions for the quick tag drawer/alert count
  const fetchUntagged = useCallback(async () => {
    try {
      const data = await api.getUntaggedTransactions()
      setUntaggedQueue(data)
    } catch (err: any) {
      console.error("Failed to fetch untagged queue:", err.message)
    }
  }, [])

  // On page mount
  useEffect(() => {
    fetchUntagged()
  }, [fetchUntagged])

  // Synchronized tag updates (renews the global untagged list)
  const updateTags = async (id: string, selectedTags: string[]) => {
    await hookUpdateTags(id, selectedTags)
    fetchUntagged()
  }

  const bulkAssignTags = async (ids: string[], selectedTags: string[]) => {
    await hookBulkAssignTags(ids, selectedTags)
    fetchUntagged()
  }

  // Handle URL search parameters (e.g. redirect from Dashboard: ?filterTag=UNTAGGED)
  const [searchParams, setSearchParams] = useSearchParams()
  const urlTag = searchParams.get("filterTag")

  useEffect(() => {
    if (urlTag) {
      setFilterTag(urlTag)
      // Clean query parameters from route history
      setSearchParams({}, { replace: true })
    }
  }, [urlTag, setFilterTag, setSearchParams])

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

  // Quick tag workflow assigner
  const handleQuickTagAssign = async (txId: string, tagName: string) => {
    try {
      await updateTags(txId, [tagName])
      
      // Update queue locally to animate instant transition
      setUntaggedQueue((prev) => prev.filter((tx) => tx.id !== txId))
      
      if (untaggedQueue.length <= 1) {
        setIsAllDone(true)
        setTimeout(() => {
          setIsAllDone(false)
          setIsQuickTagOpen(false)
          setQuickTagIndex(0)
        }, 1500)
      } else {
        if (quickTagIndex >= untaggedQueue.length - 1) {
          setQuickTagIndex(0)
        }
      }
    } catch (err: any) {
      console.error("Quick tag assign failed:", err.message)
    }
  }

  const handleSkip = () => {
    if (quickTagIndex < untaggedQueue.length - 1) {
      setQuickTagIndex((prev) => prev + 1)
    } else {
      setQuickTagIndex(0)
    }
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-2">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-50 dark:via-indigo-200 dark:to-slate-50 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View, organize, and classify all your retrieved bank statements.
          </p>
        </div>
        <Button onClick={() => { refresh(); fetchUntagged(); }} disabled={loading} size="sm" variant="outline" className="gap-2 rounded-xl">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 text-sm text-red-650 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Untagged Alert Banner */}
      {!isQuickTagOpen && untaggedQueue.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 dark:bg-amber-950/15 dark:border-amber-900/40 rounded-2xl gap-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/30 rounded-xl text-amber-600 dark:text-amber-500 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                You have {untaggedQueue.length} untagged statement{untaggedQueue.length > 1 ? "s" : ""} requiring classification.
              </span>
              <span className="text-slate-555 dark:text-slate-400 ml-1 hidden lg:inline">
                Assign tags to include them in category-based spend analysis.
              </span>
            </div>
          </div>
          <Button 
            onClick={() => { setIsQuickTagOpen(true); setQuickTagIndex(0); }}
            size="sm" 
            className="bg-amber-550 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            Start Quick-Tagging
          </Button>
        </div>
      )}

      {/* Quick-Tag Panel */}
      {isQuickTagOpen && untaggedQueue.length > 0 && (
        <Card className="border border-violet-200 bg-violet-50/10 dark:border-violet-900/50 dark:bg-violet-950/5 rounded-2xl shadow-sm relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500" />
          
          {isAllDone ? (
            <div className="h-[200px] flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center border border-emerald-200 text-emerald-600 dark:text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">All caught up! 🎉</h3>
              <p className="text-xs text-slate-400">All transactions have been categorized.</p>
            </div>
          ) : (
            <>
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-850/40">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
                    Quick-Tag Workflow
                  </CardTitle>
                  <CardDescription className="text-[10px] text-slate-400 mt-0.5">
                    Quickly classify statements sequentially without manual selection.
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    {quickTagIndex + 1} of {untaggedQueue.length}
                  </span>
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-violet-500 transition-all duration-300"
                      style={{ width: `${((quickTagIndex + 1) / untaggedQueue.length) * 100}%` }}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { setIsQuickTagOpen(false); setQuickTagIndex(0); }}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                  >
                    <X className="w-4 h-4 text-slate-450 hover:text-slate-650" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-5 space-y-5">
                {(() => {
                  const currentTx = untaggedQueue[quickTagIndex]
                  if (!currentTx) return null
                  const isDebit = currentTx.type === "DEBIT"
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60 shadow-inner">
                      <div className="md:col-span-2 space-y-1.5">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Statement Details
                        </div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {isDebit ? currentTx.receiver || "Unknown Recipient" : currentTx.sender || "Unknown Sender"}
                        </div>
                        <div className="text-xs text-slate-400 font-mono font-medium truncate max-w-full" title={currentTx.narration}>
                          {currentTx.narration}
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-400 font-medium">
                          <span>Date: {formatDate(currentTx.timestamp)} ({formatTime(currentTx.timestamp)})</span>
                          <span>Mode: {currentTx.mode}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end justify-center md:border-l md:border-slate-100 dark:md:border-slate-850/50 md:pl-6 h-full">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Flow Value
                        </div>
                        <div className={`text-xl font-extrabold ${isDebit ? "text-slate-700 dark:text-slate-350" : "text-emerald-600 dark:text-emerald-455"}`}>
                          {isDebit ? "-" : "+"}
                          {formatCurrency(currentTx.amount)}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select Classification Tag
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Button
                        key={tag.id}
                        onClick={() => handleQuickTagAssign(untaggedQueue[quickTagIndex].id, tag.name)}
                        className="text-xs font-semibold hover:shadow-md transition-all rounded-xl py-4 h-fit"
                        style={{ 
                          backgroundColor: `${tag.color}15`, 
                          color: tag.color,
                          border: `1.5px solid ${tag.color}` 
                        }}
                        variant="outline"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        {tag.name}
                      </Button>
                    ))}
                    
                    {tags.length === 0 && (
                      <p className="text-xs text-slate-400 py-1 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        No tags created yet. Visit the <Link to="/tags" className="text-indigo-500 font-bold underline hover:text-indigo-700">Tag Manager</Link> to create tags.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-slate-100 dark:border-slate-850/40 pt-4 bg-slate-50/10 dark:bg-slate-900/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  Tip: Skips do not assign any tags.
                </span>
                <Button 
                  onClick={handleSkip} 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-850 text-xs font-semibold gap-1 rounded-lg"
                >
                  Skip Transaction
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
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
                <SelectItem value="UNTAGGED">Untagged</SelectItem>
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
                    className="rounded border-slate-300 dark:border-slate-700 text-violet-650 focus:ring-violet-550"
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
                      <RefreshCw className="h-5 w-5 animate-spin text-violet-650" />
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
                          className="rounded border-slate-300 dark:border-slate-700 text-violet-650 focus:ring-violet-550"
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
                        <span className={isDebit ? "text-slate-700 dark:text-slate-300" : "text-emerald-600 dark:text-emerald-450"}>
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
                                        {hasTag && <Check className="h-3.5 w-3.5 text-violet-650" />}
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
