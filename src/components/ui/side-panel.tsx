"use client"

import React, { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./button"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: "sm" | "md" | "lg" | "xl"
}

export function SidePanel({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md"
}: SidePanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!mounted) return null

  const widthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full ${widthClasses[width]} transform bg-background shadow-2xl transition-transform duration-300 ease-in-out sm:border-r sm:border-border/50 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-background">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-background">
          {children}
        </div>

        {footer && (
          <div className="border-t border-border/50 bg-background px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
