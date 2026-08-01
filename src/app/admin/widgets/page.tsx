import React from "react"
import { getWidgets } from "@/features/widget-builder/actions"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Settings2, Trash2, Eye, EyeOff } from "lucide-react"

export default async function WidgetBuilderPage() {
  const { widgets, success } = await getWidgets()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Homepage Widget Builder</h1>
        <Button>
          <Plus className="me-2 h-4 w-4" /> Add Widget
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        {(!success || !widgets || widgets.length === 0) ? (
          <div className="p-8 text-center text-muted-foreground">
            No widgets configured for the homepage yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {widget.title || widget.type}
                      {!widget.status && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Disabled</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">Type: {widget.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Visibility Indicators */}
                  <div className="hidden sm:flex items-center gap-1 me-4">
                    {widget.showDesktop ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs me-2">Desktop</span>
                    {widget.showMobile ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-xs">Mobile</span>
                  </div>

                  <Button variant="outline" size="sm">
                    <Settings2 className="me-2 h-4 w-4" /> Configure
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
