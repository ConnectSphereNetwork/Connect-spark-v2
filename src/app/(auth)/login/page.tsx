import Link from "next/link"
import LoginForm from "@/app/components/auth/login-form"
import AuthScene from "@/app/components/auth/auth-scene"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/app/components/ui/card"


export default function LoginPage() {
  return (
    <AuthScene>
      <main className="min-h-dvh flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid gap-6 md:grid-cols-2">
          {/* Form column (mobile first) */}
          <section className="order-1 md:order-2 flex items-center">
            <Card className="w-full max-w-md shadow-lg/10 backdrop-blur-md border-border/60 animate-in fade-in zoom-in-95 duration-500 card-ambient mx-auto">
              <CardHeader>
                <CardTitle className="text-balance">Welcome back</CardTitle>
                <CardDescription className="text-pretty">
                  Sign in to continue connecting on ConnectSphere.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Optional social buttons */}
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent/40 transition-colors"
                    aria-label="Continue with Google"
                  >
                    Continue with Google
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent/40 transition-colors"
                    aria-label="Continue with GitHub"
                  >
                    Continue with GitHub
                  </Link>
                </div>

                <div className="hr-text">
                  <span>or</span>
                </div>

                <LoginForm />

                {/* Aux links */}
                <div className="flex items-center justify-between text-sm">
                  <Link href="/forgot-password" className="text-primary underline underline-offset-4">
                    Forgot password?
                  </Link>
                  <Link href="/register" className="text-primary underline underline-offset-4">
                    Create account
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Brand/hero column (left on desktop) */}
          <aside className="order-2 md:order-1 hidden md:flex">
            <div className="brand-panel relative w-full p-8 md:p-10 lg:p-12">
              <div className="space-y-4 max-w-md">
                {/* Brand title and tagline */}
                <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">ConnectSphere</h1>
                <p className="text-muted-foreground text-pretty">
                  Conversations that feel closer. Real‑time chat, calls, and communities.
                </p>
                <div className="h-24 rounded-lg border border-border/60 bg-gradient-to-tr from-[var(--brand-2)]/15 to-[var(--brand)]/10" />
                <p className="text-xs text-muted-foreground">
                  End‑to‑end experiences with speed, security, and delight.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </AuthScene>
  )
}
