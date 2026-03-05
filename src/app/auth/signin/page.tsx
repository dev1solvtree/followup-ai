"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"
import { useState } from "react"

export default function SignInPage() {
  const [email, setEmail] = useState("demo@followupai.app")

  const handleSignIn = () => {
    signIn("credentials", { email, callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <Card className="w-full max-w-md bg-[#1A1A1A] border-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-amber-500" />
            <span className="text-2xl font-bold tracking-tight">
              FollowUp<span className="text-amber-500">.AI</span>
            </span>
          </div>
          <CardTitle className="text-lg">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@followupai.app"
              className="bg-secondary mt-1"
            />
          </div>
          <Button onClick={handleSignIn} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium">
            Sign In
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Use demo@followupai.app for the demo account
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
