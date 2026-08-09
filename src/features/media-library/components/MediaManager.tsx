"use client"

import React, { useState, useEffect, useTransition } from "react"
import { uploadMediaAction, getMediaAssets, deleteMediaAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { Loader2, Trash2, Image as ImageIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MediaAsset {
  id: string;
  publicId: string;
  url: string;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  folder: string | null;
}

export function MediaManager({ onSelect }: { onSelect?: (asset: MediaAsset) => void }) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, action: null | (() => Promise<void>), title: string, desc: string, isDestructive: boolean, isLoading: boolean}>({
    isOpen: false, action: null, title: "", desc: "", isDestructive: true, isLoading: false
  });
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = () => {
    startTransition(async () => {
      const res = await getMediaAssets()
      if (res.success && res.assets) {
        setAssets(res.assets as unknown as MediaAsset[])
      } else {
        setError(res.error || "Failed to fetch media")
      }
    })
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "assal/uploads")

    const res = await uploadMediaAction(formData)
    if (res.success) {
      fetchAssets()
    } else {
      setError(res.error || "Upload failed")
    }
    setIsUploading(false)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConfirmState({
      isOpen: true,
      title: "Delete Image",
      desc: "Are you sure you want to delete this image?",
      isDestructive: true,
      isLoading: false,
      action: async () => {
        setConfirmState(p => ({ ...p, isLoading: true }));
        const res = await deleteMediaAction(id)
        if (res.success) {
          toast.success("Image deleted")
          fetchAssets()
        } else {
          toast.error(res.error || "Delete failed")
        }
        setConfirmState(p => ({ ...p, isOpen: false, isLoading: false }));
      }
    });
  }

  return (
    <div className="flex flex-col space-y-4 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Media Library</h3>
        <label className="cursor-pointer">
          <Input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
          <Button type="button" variant="outline" disabled={isUploading} className="pointer-events-none">
            {isUploading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Upload className="me-2 h-4 w-4" />}
            Upload Image
          </Button>
        </label>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {isPending && assets.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">Loading media...</div>
        ) : assets.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageIcon className="mb-2 h-8 w-8 opacity-20" />
            <p>No media found.</p>
          </div>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                "group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-border bg-muted",
                onSelect && "hover:ring-2 hover:ring-primary"
              )}
              onClick={() => onSelect?.(asset)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.publicId}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <button
                type="button"
                onClick={(e) => handleDelete(e, asset.id)}
                className="absolute end-2 top-2 rounded-md bg-red-500 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.desc}
        isDestructive={confirmState.isDestructive}
        isLoading={confirmState.isLoading}
        onConfirm={() => confirmState.action && confirmState.action()}
        onCancel={() => setConfirmState(p => ({ ...p, isOpen: false }))}
      />
    </div>
  )
}
