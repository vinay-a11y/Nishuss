"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LockKeyhole, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  hasAdminSession,
  isValidAdminCredentials,
  startAdminSession,
} from "@/lib/admin-auth"

const AdminLoginPage: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    if (hasAdminSession()) {
      router.replace("/admin/orders")
      return
    }

    setCheckingSession(false)
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isValidAdminCredentials(email, password)) {
      toast.error("Use admin@gmail.com and 123456 to log in")
      return
    }

    setLoading(true)
    startAdminSession()
    toast.success("Admin login successful")
    router.replace("/admin/orders")
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <p className="text-muted-foreground">Checking admin access...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container-custom py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-primary/20 shadow-xl">
            <CardHeader className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-3xl font-heading">Vaibhav Resto Admin</CardTitle>
              <CardDescription>Sign in to manage orders, products, and contact submissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@gmail.com"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="123456"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  <LockKeyhole className="w-4 h-4 mr-2" />
                  {loading ? "Signing in..." : "Login to Admin"}
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                Demo admin login: <span className="font-medium text-foreground">{ADMIN_EMAIL}</span> /{" "}
                <span className="font-medium text-foreground">{ADMIN_PASSWORD}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminLoginPage
