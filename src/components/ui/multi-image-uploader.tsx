"use client"
import React, { useState, useRef } from "react"
import { UploadCloud, Loader2, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MultiImageUploaderProps {
  value?: string[]
  onChange: (urls: string[]) => void
  className?: string
  label?: string
}

export function MultiImageUploader({ value = [], onChange, className, label = "اختر صور المنتج (يمكنك اختيار أكثر من صورة)" }: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await uploadFiles(files)
    }
  }

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith("image/"))
    if (validFiles.length === 0) {
      toast.error("يرجى إفلات ملفات صور صالحة")
      return
    }

    setIsUploading(true)
    const newUrls = [...value]

    for (const file of validFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`حجم الصورة ${file.name} كبير جداً. الحد الأقصى 5 ميجابايت.`)
        continue
      }
      try {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (res.ok && data.url) {
          newUrls.push(data.url)
        } else {
          toast.error(`فشل رفع ${file.name}`)
        }
      } catch (error) {
        console.error(error)
        toast.error(`خطأ أثناء رفع ${file.name}`)
      }
    }
    
    onChange(newUrls)
    setIsUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    await uploadFiles(files)
  }

  const handleRemove = (index: number) => {
    const newUrls = [...value]
    newUrls.splice(index, 1)
    onChange(newUrls)
  }

  return (
    <div className={cn("space-y-4", className)} onDragOver={handleDragOver} onDrop={handleDrop}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      {/* Existing Images Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {value.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted">
              <img src={url} alt={`صورة ${i+1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button 
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="bg-destructive text-white p-2 rounded-full hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {i === 0 && (
                <div className="absolute top-2 right-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                  الرئيسية
                </div>
              )}
            </div>
          ))}
          
          {/* Add more button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-muted/20 flex flex-col items-center justify-center text-muted-foreground disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <UploadCloud className="w-6 h-6 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      )}

      {/* Empty State Upload Area */}
      {value.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-32 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors bg-muted/20 flex flex-col items-center justify-center text-muted-foreground disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          ) : (
            <UploadCloud className="w-8 h-8 mb-2 hover:scale-110 transition-transform" />
          )}
          <span className="text-sm font-medium">
            {isUploading ? "جاري الرفع..." : "اضغط أو اسحب الصور هنا للرفع"}
          </span>
        </button>
      )}

      <input 
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={inputRef}
        onChange={handleFileSelect}
      />
    </div>
  )
}
