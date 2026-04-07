"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { auth } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { userService } from "@/lib/firebase-services"
import toast from "react-hot-toast"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"form" | "success">("form")

  // ✅ HANDLE SUBMIT
  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields")
      return
    }

    if (!isLogin && !name.trim()) {
      toast.error("Please enter your name")
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        // 🔐 LOGIN
        await signInWithEmailAndPassword(auth, email, password)
        toast.success("Login successful 🚀")
      } else {
        // 🆕 REGISTER
        const res = await createUserWithEmailAndPassword(auth, email, password)

        // ✅ Create Firestore profile
        await userService.createOrUpdateUser(res.user.uid, {
          name: name.trim(),
          email: email,
          phoneNumber: "",
        })

        toast.success("Account created 🚀")
      }

      setStep("success")

      setTimeout(() => {
        onClose()
        resetForm()
      }, 2000)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setIsLogin(true)
    setStep("form")
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center space-x-2 text-xl font-heading">
            <Shield className="w-6 h-6 text-primary" />
            <span>
              {step === "form" && (isLogin ? "Login" : "Register")}
              {step === "success" && "Welcome!"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <AnimatePresence mode="wait">

            {/* FORM */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {!isLogin && (
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-12"
                >
                  {loading
                    ? "Please wait..."
                    : isLogin
                    ? "Login"
                    : "Register"}
                </Button>

                <p
                  className="text-center text-sm cursor-pointer text-primary"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin
                    ? "Don't have an account? Register"
                    : "Already have an account? Login"}
                </p>
              </motion.div>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center space-y-4 py-8"
              >
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">
                  Welcome {name || "Back"}!
                </h3>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal