import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function Tags() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Tags Manager</h1>
        <p className="text-slate-500 dark:text-slate-400">Create, edit, and delete custom tags for classification.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Manage Tags</CardTitle>
          <CardDescription>Custom tags help you organize and filter your financial analytics.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center border border-dashed rounded-md m-6 text-muted-foreground">
          Tag Manager List Placeholder (Pending Phase 2 component task)
        </CardContent>
      </Card>
    </div>
  )
}
