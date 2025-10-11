"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export default function AuthScene({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative min-h-dvh overflow-hidden bg-background text-foreground", className)}>
      {/* Ambient glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="glow-orb glow-orb--tl" />
        <div className="glow-orb glow-orb--br" />
      </div>

      {/* Animated grid mask overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-mask" />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  )
}
