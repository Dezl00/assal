import React from "react"
import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  )
}
