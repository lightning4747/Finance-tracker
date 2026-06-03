import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function Transactions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Transactions</h1>
        <p className="text-slate-500 dark:text-slate-400">View, search, tag, and organize all your bank transactions.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A list of transactions retrieved from your linked bank accounts.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center border border-dashed rounded-md m-6 text-muted-foreground">
          Transaction Table Placeholder (Pending Phase 2 component task)
        </CardContent>
      </Card>
    </div>
  )
}
