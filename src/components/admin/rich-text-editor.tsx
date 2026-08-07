"use client"

import React, { useMemo, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"
import { toast } from "sonner"

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="min-h-[400px] bg-slate-50 border border-border rounded-lg flex items-center justify-center text-muted-foreground animate-pulse">جاري تحميل المحرر...</div>
})

export function RichTextEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const quillRef = useRef<any>(null)

  const imageHandler = useCallback(() => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0]
        const formData = new FormData()
        formData.append("file", file)

        const toastId = toast.loading("جاري رفع الصورة...")
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })
          
          if (!res.ok) throw new Error("Upload failed")
            
          const data = await res.json()
          
          const quill = quillRef.current?.getEditor()
          if (quill) {
            const range = quill.getSelection(true)
            quill.insertEmbed(range.index, "image", data.url)
            quill.setSelection(range.index + 1)
          }
          toast.success("تم رفع الصورة بنجاح", { id: toastId })
        } catch (error) {
          toast.error("فشل رفع الصورة", { id: toastId })
        }
      }
    }
  }, [])

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler])

  const formats = [
    "header",
    "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "indent",
    "direction", "align",
    "color", "background",
    "link", "image", "video"
  ]

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden [&_.ql-container]:min-h-[400px] [&_.ql-container]:text-base [&_.ql-editor]:min-h-[400px] [&_.ql-editor]:text-right [&_.ql-editor]:rtl">
      <ReactQuill
        // @ts-ignore
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="w-full text-right"
        placeholder="اكتب محتوى المقال هنا..."
      />
    </div>
  )
}
