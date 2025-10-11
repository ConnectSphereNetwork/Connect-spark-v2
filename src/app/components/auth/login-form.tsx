"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"

// import { Label } from "@/components/ui/label"
import { postJson } from "@/lib/api"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await postJson("/api/auth/login", { email, password })
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err?.message || "Unable to sign in. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={!!error && email.length === 0}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          aria-invalid={!!error && password.length < 6}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full inline-flex h-10 items-center justify-center rounded-md bg-primary text-primary-foreground transition-[transform,box-shadow,background-color] hover:translate-y-[-1px] active:translate-y-0 shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  )
}
