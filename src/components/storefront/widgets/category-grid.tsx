import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"

export async function CategoryGrid({ widget }: { widget: any }) {
  // Fetch main categories (parentId = null)
  const categories = await db.category.findMany({
    where: { parentId: null },
    take: 8,
    orderBy: { createdAt: 'desc' }
  })

  if (categories.length === 0) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {widget.title && (
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{widget.title}</h2>
          {widget.subtitle && <p className="mt-4 text-muted-foreground">{widget.subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/category/${category.slug}`}
            className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="relative h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-full bg-muted/30 p-2 transition-transform group-hover:scale-105">
              {category.imageUrl ? (
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">{category.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-center group-hover:text-primary transition-colors">{category.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
