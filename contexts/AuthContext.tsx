"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { userService, type UserProfile } from "@/lib/firebase-services"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshUserProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUserProfile = async () => {
    if (!user) return

    try {
      const profile = await userService.getUserProfile(user.uid)
      setUserProfile(profile)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          let profile = await userService.getUserProfile(firebaseUser.uid)

          // ✅ AUTO CREATE PROFILE IF NOT EXISTS
          if (!profile) {
            await userService.createOrUpdateUser(firebaseUser.uid, {
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              phoneNumber: firebaseUser.phoneNumber || "",
            })

            // fetch again after creating
            profile = await userService.getUserProfile(firebaseUser.uid)
          }

          setUserProfile(profile)
        } catch (error) {
          console.error("Error handling user profile:", error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}