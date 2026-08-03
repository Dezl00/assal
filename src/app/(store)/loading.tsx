import React from "react"

export default function StoreLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-muted-foreground font-medium animate-pulse">جاري التحميل...</p>
    </div>
  )
}
