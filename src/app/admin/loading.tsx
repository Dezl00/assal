import React from "react"

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="h-6 w-32 bg-muted rounded-md animate-pulse"></div>
        <div className="h-10 w-32 bg-muted rounded-md animate-pulse hidden md:block"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-[600px] md:col-span-1 rounded-xl bg-muted/50 border border-border/50 animate-pulse"></div>
        <div className="h-[600px] md:col-span-2 rounded-xl bg-muted/50 border border-border/50 animate-pulse"></div>
      </div>
    </div>
  )
}
