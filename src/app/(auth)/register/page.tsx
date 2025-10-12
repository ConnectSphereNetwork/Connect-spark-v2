import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import AuthScene from "@/app/components/auth/auth-scene"
import SignupForm from "@/app/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <AuthScene>
      <main className="min-h-dvh flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid gap-6 md:grid-cols-2">
          {/* Form column */}
          <section className="order-1 md:order-2 flex items-center">
            <Card className="w-full max-w-md shadow-lg/10 backdrop-blur-md border-border/60 animate-in fade-in zoom-in-95 duration-500 card-ambient mx-auto">
              <CardHeader>
                <CardTitle className="text-balance">Create your account</CardTitle>
                <CardDescription className="text-pretty">
                  Join ConnectSphere to meet new people and chat in real time.
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

                <SignupForm />

                <div className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Brand/hero column */}
          <aside className="order-2 md:order-1 hidden md:flex">
            <div className="brand-panel relative w-full p-8 md:p-10 lg:p-12">
              <div className="space-y-4 max-w-md">
                {/* Brand title and tagline */}
                <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">ConnectSphere</h1>
                <p className="text-muted-foreground text-pretty">
                  Make new connections and discover conversations that matter.
                </p>
                <div className="h-24 rounded-lg border border-border/60 bg-gradient-to-tr from-[var(--brand-2)]/15 to-[var(--brand)]/10" />
                <p className="text-xs text-muted-foreground">Safe, fast, and built for real‑time.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </AuthScene>
  )
}
