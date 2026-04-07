"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, MessageSquareText, Package, ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { clearAdminSession } from "@/lib/admin-auth"

interface AdminNavigationProps {
  title: string
  description: string
  actions?: React.ReactNode
}

const adminLinks = [
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/contacts", label: "Contacts", icon: MessageSquareText },
]

const AdminNavigation: React.FC<AdminNavigationProps> = ({ title, description, actions }) => {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearAdminSession()
    toast.success("Logged out from admin")
    router.replace("/admin")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-3">
          {actions}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href}>
              <Button variant={isActive ? "default" : "outline"}>
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default AdminNavigation
