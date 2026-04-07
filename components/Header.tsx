"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, ShoppingCart, Phone, Menu, LogIn, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import AuthModal from "./auth/AuthModal"
import UserProfile from "./auth/UserProfile"

const Header: React.FC = () => {
  const { user, userProfile } = useAuth()
  const { cartItemCount } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const totalItems = cartItemCount

  const navItems = [
    { name: "Menu", href: "/menu", icon: null },
    { name: "My Orders", href: "/orders", icon: Package },
    { name: "Contact", href: "/contact", icon: Phone },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm"
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button - Left */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="animate-glow">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 glass-effect-orange">
                  {/* Mobile Header */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-3 pb-6 border-b border-orange-500/20">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center animate-pulse-orange">
                        <span className="text-black font-bold text-xl">B</span>
                      </div>
                      <div>
                        <h2 className="font-heading font-bold text-lg neon-text">Biryani Adda</h2>
                        <p className="text-sm text-orange-400">Authentic Flavors</p>
                      </div>
                    </div>

                    {/* User Section */}
                    <div className="py-6 border-b border-orange-500/20">
                      {user && userProfile ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{userProfile.name}</p>
                            <p className="text-sm text-orange-300">+91 {userProfile.phoneNumber}</p>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setIsAuthModalOpen(true)
                            setIsMobileMenuOpen(false)
                          }}
                          className="w-full btn-primary animate-glow"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login to Continue
                        </Button>
                      )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-500/10 transition-colors border border-transparent hover:border-orange-500/20"
                        >
                          {item.icon && <item.icon className="w-5 h-5 text-orange-400" />}
                          <span className="font-medium text-white">{item.name}</span>
                        </Link>
                      ))}

                      <Link
                        href="/cart"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-500/10 transition-colors border border-transparent hover:border-orange-500/20"
                      >
                        <div className="flex items-center space-x-3">
                          <ShoppingCart className="w-5 h-5 text-orange-400" />
                          <span className="font-medium text-white">Cart</span>
                        </div>
                        {totalItems > 0 && (
                          <Badge className="bg-primary text-primary-foreground animate-pulse-orange">
                            {totalItems}
                          </Badge>
                        )}
                      </Link>

                      {user && (
                        <button
                          onClick={() => {
                            setIsProfileOpen(true)
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-500/10 transition-colors w-full text-left border border-transparent hover:border-orange-500/20"
                        >
                          <User className="w-5 h-5 text-orange-400" />
                          <span className="font-medium text-white">My Profile</span>
                        </button>
                      )}
                    </nav>

                    {/* Call Button */}
                    <div className="pt-6 border-t border-orange-500/20">
                      <Button className="w-full btn-secondary animate-glow">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now: +91 98765 43210
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link
              href="/"
              className="flex items-center space-x-2 md:flex-none absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center animate-pulse-orange">
                <span className="text-black font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-heading font-bold">
                <span className="text-primary neon-text">Biryani</span>
                <span className="text-foreground"> Adda</span>
              </span>
            </Link>

            <div className="md:hidden">
              <Link href="/cart">
                <Button
                  variant="ghost"
                  className="relative text-foreground hover:text-primary hover:bg-primary/10 animate-glow"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                      <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center p-0 animate-pulse-orange">
                        {totalItems}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => setIsProfileOpen(true)}
                  className="text-foreground hover:text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
                >
                  <User className="w-4 h-4 mr-2" />
                  {userProfile?.name || "Profile"}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-foreground hover:text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}

              <Link href="/cart">
                <Button
                  variant="ghost"
                  className="relative text-foreground hover:text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                  {totalItems > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                      <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center p-0 animate-pulse-orange">
                        {totalItems}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Profile Sheet */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto glass-effect-orange">
          <UserProfile onClose={() => setIsProfileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Header
