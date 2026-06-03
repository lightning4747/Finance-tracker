import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  KeyRound, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  HelpCircle, 
  Info, 
  ArrowRight, 
  Lock,
  Database,
  Check,
  Calendar,
  Sparkles
} from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "../lib/api"

export default function Fetch() {
  // Load initial states from localStorage
  const [vua, setVua] = useState(() => localStorage.getItem("vua") || "9999999999@onemoney")
  const [consentId, setConsentId] = useState(() => localStorage.getItem("consentId") || "")
  const [consentStatus, setConsentStatus] = useState(() => localStorage.getItem("consentStatus") || "")
  const [consentUrl, setConsentUrl] = useState(() => localStorage.getItem("consentUrl") || "")
  const [lastSyncedAt, setLastSyncedAt] = useState(() => localStorage.getItem("lastSyncedAt") || "")

  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncSummary, setSyncSummary] = useState<{ inserted: number; accounts: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isApproved = consentStatus === "ACTIVE" || consentStatus === "APPROVED"

  // Polling for consent status check when PENDING
  useEffect(() => {
    let intervalId: any = null
    
    if (consentId && !isApproved && consentStatus !== "REJECTED" && consentStatus !== "EXPIRED") {
      intervalId = setInterval(async () => {
        try {
          const res = await api.getConsentStatus(consentId)
          if (res.status === "ACTIVE" || res.status === "APPROVED") {
            setConsentStatus(res.status)
            localStorage.setItem("consentStatus", res.status)
            setSuccessMessage("Bank consent approved! You can now retrieve transactions.")
          } else if (res.status === "REJECTED" || res.status === "EXPIRED") {
            setConsentStatus(res.status)
            localStorage.setItem("consentStatus", res.status)
            setError(`Consent link request was ${res.status.toLowerCase()}.`)
          }
        } catch (err: any) {
          console.error("Error polling consent status:", err.message)
        }
      }, 5000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [consentId, consentStatus, isApproved])

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vua.trim()) {
      setError("Please specify a VUA (Virtual Unified Address)")
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    setSyncSummary(null)
    
    try {
      const res = await api.createConsent(vua)
      setConsentId(res.id)
      setConsentUrl(res.url)
      setConsentStatus(res.status)
      
      localStorage.setItem("vua", vua)
      localStorage.setItem("consentId", res.id)
      localStorage.setItem("consentUrl", res.url)
      localStorage.setItem("consentStatus", res.status)
      
      setSuccessMessage("Consent request link generated. Please authorize the connection.")
    } catch (err: any) {
      setError(err.message || "Failed to create bank consent request")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyStatus = async () => {
    if (!consentId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.getConsentStatus(consentId)
      setConsentStatus(res.status)
      localStorage.setItem("consentStatus", res.status)
      
      if (res.status === "ACTIVE" || res.status === "APPROVED") {
        setSuccessMessage("Consent has been authorized successfully!")
      } else {
        setSuccessMessage(`Consent status: ${res.status}`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to query consent link status")
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    if (!consentId) return
    setSyncing(true)
    setError(null)
    setSuccessMessage(null)
    setSyncSummary(null)
    
    try {
      const res = await api.triggerFetch(consentId)
      const now = new Date().toLocaleString("en-IN")
      setLastSyncedAt(now)
      localStorage.setItem("lastSyncedAt", now)
      
      setSyncSummary({
        inserted: res.insertedTransactionsCount || 0,
        accounts: res.accountsProcessed || 0
      })
      setSuccessMessage("Local database synchronization completed successfully.")
    } catch (err: any) {
      setError(err.message || "Failed to synchronize transactions")
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = () => {
    setConsentId("")
    setConsentStatus("")
    setConsentUrl("")
    setSyncSummary(null)
    setError(null)
    setSuccessMessage(null)
    
    localStorage.removeItem("consentId")
    localStorage.removeItem("consentStatus")
    localStorage.removeItem("consentUrl")
    localStorage.removeItem("lastSyncedAt")
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6 py-2">
      {/* Page Header */}
      <div className="border-b border-slate-100 dark:border-slate-800/60 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-50 dark:via-indigo-200 dark:to-slate-50 bg-clip-text text-transparent">
          Sync Bank Data
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Initiate bank consent authorization and fetch your transaction histories locally.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/15 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl border border-emerald-100/70 dark:border-emerald-950/30 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sync Stepper (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-100 dark:border-slate-900/80">
            <CardHeader className="border-b border-slate-100 dark:border-slate-900/60 pb-5">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                Account Aggregator Connection Status
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Link and synchronize bank transactions securely using RBI's Account Aggregator framework.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-8">
              
              {/* Step 1: Link Bank Account */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    consentId 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-600" 
                      : "border-indigo-500 text-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20"
                  }`}>
                    {consentId ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <div className="w-[2px] h-full bg-slate-100 dark:bg-slate-850 mt-1 min-h-[30px]" />
                </div>
                <div className="flex-1 pb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Step 1: Link Bank Account
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Provide your Account Aggregator identifier (VUA) to create a consent request.
                  </p>
                  
                  {!consentId ? (
                    <form onSubmit={handleCreateConsent} className="mt-4 flex gap-2 max-w-md">
                      <div className="relative flex-1">
                        <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input 
                          placeholder="e.g. 9999999999@onemoney" 
                          value={vua}
                          onChange={(e) => setVua(e.target.value)}
                          className="pl-9 text-sm"
                          disabled={loading}
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="text-xs font-semibold gap-1">
                        {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        Connect
                      </Button>
                    </form>
                  ) : (
                    <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-850/60 max-w-md">
                      <div className="text-xs space-y-0.5">
                        <div className="text-slate-400 font-medium">Aggregator ID (VUA):</div>
                        <div className="font-bold text-slate-700 dark:text-slate-350">{vua}</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/10">
                        Linked
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Authorize Consent */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    !consentId
                      ? "border-slate-200 text-slate-350 bg-slate-50 dark:border-slate-800 dark:text-slate-600 dark:bg-slate-900/20"
                      : isApproved
                      ? "bg-emerald-50 border-emerald-500 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-600"
                      : "border-indigo-500 text-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 animate-pulse"
                  }`}>
                    {isApproved ? <Check className="w-4 h-4" /> : "2"}
                  </div>
                  <div className="w-[2px] h-full bg-slate-100 dark:bg-slate-850 mt-1 min-h-[30px]" />
                </div>
                <div className="flex-1 pb-4">
                  <h3 className={`text-sm font-bold ${
                    !consentId 
                      ? "text-slate-350 dark:text-slate-600" 
                      : "text-slate-800 dark:text-slate-200"
                  }`}>
                    Step 2: Authorize Consent Link
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Access the secure Setu portal to authenticate the linked consent permissions.
                  </p>
                  
                  {consentId && (
                    <div className="mt-4 space-y-3 max-w-md">
                      <div className="text-xs space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-850/60">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Consent Link ID:</span>
                          <span className="font-mono font-bold text-slate-650 dark:text-slate-400">{consentId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Approval Status:</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            isApproved
                              ? "bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-100/50 dark:bg-amber-950/30 text-amber-650 dark:text-amber-450 animate-pulse"
                          }`}>
                            {consentStatus}
                          </span>
                        </div>
                      </div>

                      {!isApproved ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <a 
                            href={consentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button className="w-full text-xs font-semibold gap-1" variant="outline">
                              <ExternalLink className="w-3.5 h-3.5" />
                              Authorize in Portal
                            </Button>
                          </a>
                          
                          <Button 
                            onClick={handleVerifyStatus} 
                            disabled={loading}
                            className="text-xs font-semibold"
                          >
                            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                            Verify Link
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-1.5 bg-emerald-50/40 dark:bg-emerald-950/10 p-2.5 rounded-lg border border-emerald-100/30">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Link authorized and approved.</span>
                        </div>
                      )}
                      
                      {!isApproved && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1 animate-pulse">
                          Automatic monitoring active. App is polling status every 5 seconds...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Fetch Data */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    isApproved
                      ? "border-indigo-500 text-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20"
                      : "border-slate-200 text-slate-350 bg-slate-50 dark:border-slate-800 dark:text-slate-600 dark:bg-slate-900/20"
                  }`}>
                    "3"
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-bold ${
                    isApproved 
                      ? "text-slate-800 dark:text-slate-200" 
                      : "text-slate-350 dark:text-slate-600"
                  }`}>
                    Step 3: Retrieve local transactions
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Pull, parse, and synchronize records into your local database.
                  </p>
                  
                  {isApproved && (
                    <div className="mt-4 space-y-4 max-w-md">
                      <Button 
                        onClick={handleSync} 
                        disabled={syncing}
                        className="text-xs font-bold gap-1.5 w-full sm:w-auto px-5 py-5 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Synchronizing Local Database..." : "Sync Transactions Now"}
                      </Button>

                      {syncSummary && (
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850/60 space-y-2">
                          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Sync Summary Statistics
                          </h4>
                          <div className="grid grid-cols-2 gap-4 pt-1">
                            <div className="text-center bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                              <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                                {syncSummary.accounts}
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                                Accounts Processed
                              </div>
                            </div>
                            <div className="text-center bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                                {syncSummary.inserted}
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                                New Items Imported
                              </div>
                            </div>
                          </div>
                          <div className="pt-2 text-center">
                            <Link to="/">
                              <Button size="sm" variant="outline" className="text-[11px] font-semibold gap-1 h-8">
                                Go to Dashboard
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
            
            {consentId && (
              <CardFooter className="border-t border-slate-100 dark:border-slate-900/60 pt-4 bg-slate-50/20 dark:bg-slate-900/5 flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Local data isolation active
                </span>
                <Button 
                  onClick={handleDisconnect} 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold gap-1 text-[11px] h-8"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Disconnect VUA
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Sidebar Info (Right Column) */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Active Connection details */}
          <Card className="shadow-sm border-slate-100 dark:border-slate-900/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Connection Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-2">
                  <span className="text-slate-400 font-medium">Link Status:</span>
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className={`w-2 h-2 rounded-full ${
                      isApproved 
                        ? "bg-emerald-500 shadow-sm animate-pulse" 
                        : consentId 
                        ? "bg-amber-500 animate-pulse" 
                        : "bg-slate-350 dark:bg-slate-750"
                    }`} />
                    {isApproved ? "Connected" : consentId ? "Authorizing" : "Disconnected"}
                  </span>
                </div>
                {lastSyncedAt && (
                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-850 pb-2">
                    <span className="text-slate-400 font-medium">Last Synced:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-right">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {lastSyncedAt}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Mode:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                    Setu Sandbox
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sandbox Help details */}
          <Card className="shadow-sm border-slate-100 dark:border-slate-900/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Testing Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                We are configured to run in **Setu Sandbox** mode. Use these parameters to complete test runs:
              </p>
              
              <div className="space-y-2.5 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-850/60">
                <div className="space-y-1">
                  <div className="text-slate-450 dark:text-slate-500 font-medium text-[10px] uppercase">Test VUA</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-300">9999999999@onemoney</div>
                </div>
                <div className="space-y-1 border-t border-slate-200/50 dark:border-slate-800/40 pt-1.5">
                  <div className="text-slate-450 dark:text-slate-500 font-medium text-[10px] uppercase">OTP Code</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-300">123456</div>
                </div>
                <div className="space-y-1 border-t border-slate-200/50 dark:border-slate-800/40 pt-1.5">
                  <div className="text-slate-450 dark:text-slate-500 font-medium text-[10px] uppercase">FIP Selector</div>
                  <div className="text-slate-650 dark:text-slate-400 font-semibold leading-normal">
                    Choose **HDFC Bank** or **Mock Bank** on the Setu portal list.
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-450 dark:text-slate-500 leading-normal flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  The mock FIP returns 12 transactions spanning April to June. Sync operations deduplicate automatically via Setu ID hashes.
                </span>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  )
}
