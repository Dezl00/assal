import React from "react"
import { Button } from "./button"
import { AlertCircle, Loader2 } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmModal({ isOpen, title, description, onConfirm, onCancel, isDestructive = true, isLoading = false }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="bg-card border border-border shadow-lg rounded-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>إلغاء</Button>
          <Button 
            variant={isDestructive ? "destructive" : "default"} 
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد"}
          </Button>
        </div>
      </div>
    </div>
  )
}
