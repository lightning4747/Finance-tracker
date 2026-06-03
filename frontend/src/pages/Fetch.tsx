import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function Fetch() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Sync Bank Data</h1>
        <p className="text-slate-500 dark:text-slate-400">Initiate bank consent requests and fetch financial transactions.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Account Aggregator Sync</CardTitle>
          <CardDescription>We use Setu Account Aggregator to securely fetch transactions directly from your banks.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center border border-dashed rounded-md m-6 text-muted-foreground">
          Fetch Consent Sync Flow Placeholder (Pending Phase 4 component task)
        </CardContent>
      </Card>
    </div>
  )
}
