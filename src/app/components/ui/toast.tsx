import * as React from "react"
import { cn } from "@/lib/utils"

export function Toast({ title, description, action }: any) {
  return (
    <div className={cn("rounded-md bg-white shadow-md p-4")}>
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm text-gray-600">{description}</div>}
      {action}
    </div>
  )
}

export function ToastViewport() {
  return (
    <div className="fixed bottom-0 right-0 flex flex-col p-4 gap-2 z-[9999]" />
  )
}
