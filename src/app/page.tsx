import { getWidgets } from "@/features/widget-builder/actions"

export default async function StorefrontPage() {
  const { widgets, success } = await getWidgets()

  if (!success) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        Failed to load homepage widgets.
      </div>
    )
  }

  if (!widgets || widgets.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-muted-foreground">
        <h2 className="text-2xl font-medium">Welcome to Assal</h2>
        <p className="mt-2">No homepage widgets found. Please add them from the Admin Dashboard.</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* 
        Here we will map through the widgets and render the appropriate Component.
        For example:
        {widgets.map(widget => (
          <WidgetRenderer key={widget.id} widget={widget} />
        ))}
      */}
      <div className="p-8">
        <h1 className="mb-8 text-3xl font-bold">Storefront (Dynamic Widgets)</h1>
        <div className="space-y-8">
          {widgets.map((widget) => (
            <div key={widget.id} className="rounded-lg border border-border p-6 shadow-none">
              <h3 className="text-xl font-semibold">{widget.title || widget.type}</h3>
              {widget.subtitle && <p className="text-muted-foreground">{widget.subtitle}</p>}
              <div className="mt-4 rounded bg-secondary p-4 text-sm text-secondary-foreground">
                <pre>{JSON.stringify(widget, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
