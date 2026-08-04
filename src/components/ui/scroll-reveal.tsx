"use client"
import React, { useRef, useEffect, useState } from "react"

type AnimationVariant = 
  | "fade-up" 
  | "fade-down" 
  | "fade-left" 
  | "fade-right" 
  | "zoom-in" 
  | "zoom-out"
  | "flip-up"
  | "blur-in"

interface ScrollRevealProps {
  children: React.ReactNode
  variant?: AnimationVariant
  delay?: number
  duration?: number
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

const variantStyles: Record<AnimationVariant, { from: React.CSSProperties; to: React.CSSProperties }> = {
  "fade-up": {
    from: { opacity: 0, transform: "translateY(32px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  "fade-down": {
    from: { opacity: 0, transform: "translateY(-32px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  "fade-left": {
    from: { opacity: 0, transform: "translateX(32px)" },
    to: { opacity: 1, transform: "translateX(0)" },
  },
  "fade-right": {
    from: { opacity: 0, transform: "translateX(-32px)" },
    to: { opacity: 1, transform: "translateX(0)" },
  },
  "zoom-in": {
    from: { opacity: 0, transform: "scale(0.9)" },
    to: { opacity: 1, transform: "scale(1)" },
  },
  "zoom-out": {
    from: { opacity: 0, transform: "scale(1.05)" },
    to: { opacity: 1, transform: "scale(1)" },
  },
  "flip-up": {
    from: { opacity: 0, transform: "perspective(800px) rotateX(8deg) translateY(24px)" },
    to: { opacity: 1, transform: "perspective(800px) rotateX(0deg) translateY(0)" },
  },
  "blur-in": {
    from: { opacity: 0, filter: "blur(8px)", transform: "translateY(16px)" },
    to: { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
  },
}

export function ScrollReveal({ 
  children, 
  variant = "fade-up", 
  delay = 0, 
  duration = 0.6, 
  className = "",
  as: Tag = "div"
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "30px" }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const styles = variantStyles[variant]
  const currentStyle = isVisible ? styles.to : styles.from

  const Component = Tag as any

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        ...currentStyle,
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, filter ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: isVisible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Component>
  )
}
