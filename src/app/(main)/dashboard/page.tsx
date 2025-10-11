"use client"

import AuthScene from "@/app/components/auth/auth-scene"
import Header from "@/app/components/Header"
import ProtectedRoute from "@/app/components/ProtectedRoute"
import PushNotificationManager from "@/app/components/PushNotificationManager"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Spinner } from "@/app/components/ui/spinner"
import { useAuth } from "@/context/AuthContext"
import { postJson } from "@/lib/api"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"


function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isMatching, setIsMatching] = useState(false)

  const handleFindMatch = async () => {
    setIsMatching(true)
    try {
      const response = await postJson("/api/match/find", {})
      const newChatId = response.data.chat._id
      // Navigate to the new private chat room
      router.push(`/chat/${newChatId}`)
    } catch (error: any) {
      console.error(error)
      alert(error.message) 
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <ProtectedRoute>
      <AuthScene className="pt-16">
        <main className="container mx-auto px-6 py-10">
          <section className="mx-auto max-w-2xl">
            <Card className="backdrop-blur supports-[backdrop-filter]:bg-card/70 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="text-balance text-3xl md:text-4xl">Your Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                {user && (
                  <div className="mt-1 grid gap-2 rounded-lg border p-4 animate-in fade-in-50 duration-500">
                    <p className="text-base">
                      Welcome, <span className="font-medium">{user.username}</span>!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have <span className="font-semibold">{user.tokens}</span> tokens.
                    </p>
                  </div>
                )}
                <div className="mt-6">
                  <Button
                    size="lg"
                    onClick={handleFindMatch}
                    disabled={isMatching}
                    aria-busy={isMatching}
                    className="w-full sm:w-auto transition-colors duration-300 disabled:opacity-70"
                  >
                    {isMatching ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="size-4" />
                        <span>Searching for a partner...</span>
                      </span>
                    ) : (
                      "Find a New Match (50 Tokens)"
                    )}
                  </Button>
                </div>

                 <div className="mt-6 border-t pt-4">
                  <PushNotificationManager />
                </div>
                
              </CardContent>
            </Card>
          </section>
          <section className="mx-auto mt-6 max-w-2xl">
            <Card className="backdrop-blur supports-[backdrop-filter]:bg-card/60 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-150">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Sparkles className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-pretty">About This Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This app helps you discover new connections through private chat matching. Use your tokens to find a
                  partner, start a focused conversation, and grow your network.
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Secure access with protected routes and a polished, animated interface.</li>
                  <li>Token-based matching to keep sessions meaningful and purposeful.</li>
                  <li>Friends & requests workflow to manage your connections over time.</li>
                </ul>
                <p className="text-xs">
                  Tip: Matching takes a moment while we find the best partner—sit tight and watch for the loader.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
      </AuthScene>
    </ProtectedRoute>
  )
}

export default DashboardPage
