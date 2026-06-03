import { useState } from "react"
import { useTags } from "../hooks/useTags"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tag as TagIcon, Trash2, Plus, Check, AlertTriangle } from "lucide-react"

// Curated modern color palette
const PRESET_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Slate", value: "#64748b" },
]

export default function Tags() {
  const { tags, loading, error, createTag, deleteTag } = useTags()
  const [tagName, setTagName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const nameTrimmed = tagName.trim()
    if (!nameTrimmed) {
      setFormError("Tag name is required.")
      return
    }

    // Client side uniqueness check
    if (tags.some((t) => t.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setFormError("A tag with this name already exists.")
      return
    }

    setIsSubmitting(true)
    try {
      await createTag(nameTrimmed, selectedColor)
      setTagName("")
    } catch (err: any) {
      setFormError(err.message || "Failed to create tag.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tag? It will also be removed from all assigned transactions.")) {
      try {
        await deleteTag(id)
      } catch (err: any) {
        alert(err.message || "Failed to delete tag.")
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Tags Manager</h1>
        <p className="text-slate-500 dark:text-slate-400">Create, customize, and manage tags for category-wise transaction tracking.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Form: Create Tag */}
        <div className="md:col-span-1">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Create New Tag</CardTitle>
              <CardDescription>Add a new category with a customized theme color.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div className="flex items-center gap-1.5 p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="tag-name">Tag Name</Label>
                  <Input
                    id="tag-name"
                    placeholder="e.g. Groceries, Rent, Salary"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    maxLength={30}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label>Accent Color</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className="w-full aspect-square rounded-full transition-transform duration-200 hover:scale-110 flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                        title={color.name}
                      >
                        {selectedColor === color.value && (
                          <Check className="h-3.5 w-3.5 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 mt-4"
                >
                  <Plus className="h-4 w-4" />
                  Create Tag
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Tags List */}
        <div className="md:col-span-2">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Classifier Tags</CardTitle>
                <CardDescription>List of available classification tags.</CardDescription>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                {tags.length} Active Tags
              </span>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 animate-pulse">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                          <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-8" />
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-805" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="h-64 flex flex-col items-center justify-center text-red-500 gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  <span>Failed to load tags: {error}</span>
                </div>
              ) : tags.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed rounded-2xl p-6 text-center">
                  <TagIcon className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="font-semibold text-sm">No tags defined yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Create tags using the form on the left to start classifying your transactions.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-2 ring-offset-2 ring-transparent group-hover:ring-slate-300 dark:group-hover:ring-slate-700 transition-all duration-200"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {tag.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {tag.color}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(tag.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
