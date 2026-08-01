"use client"
import React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
    
    // We handle both controlled and uncontrolled states slightly differently, 
    // but typically a simple input checkbox is easiest for native forms.
    return (
      <label className={cn("relative inline-flex items-center cursor-pointer", className)}>
        <input 
          type="checkbox" 
          className="sr-only peer" 
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props} 
        />
        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
      </label>
    )
  }
)
Switch.displayName = "Switch"
