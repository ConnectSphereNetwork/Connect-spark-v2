"use client"

import { Toast, ToastViewport } from "./toast"
// import {
//   Toast,
//   ToastViewport,
// } from "@/components/ui/toast"
import { useToast } from "./use-toast"
// import { useToast } from "@/components/ui/use-toast"


export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastViewport>
      {toasts.map((t) => (
        <Toast key={t.id} title={t.title} description={t.description} action={t.action} />
      ))}
    </ToastViewport>
  )
}
