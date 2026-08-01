import React from "react"
import { MediaManager } from "@/features/media-library/components/MediaManager"

export default function MediaLibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Centralized Media Library</h1>
        <p className="text-muted-foreground mt-1">Manage all your images and assets via Cloudinary.</p>
      </div>

      <div className="bg-card">
        <MediaManager />
      </div>
    </div>
  )
}
