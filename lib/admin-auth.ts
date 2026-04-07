export const ADMIN_EMAIL = "admin@gmail.com"
export const ADMIN_PASSWORD = "123456"
const ADMIN_SESSION_KEY = "vaibhav_resto_admin_session"

export const ADMIN_ORDER_STATUSES = [
  "CONFIRMED",
  "PREPARING",
  "PICKUP",
  "DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const

export const isValidAdminCredentials = (email: string, password: string) =>
  email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD

export const hasAdminSession = () => {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === "true"
}

export const startAdminSession = () => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ADMIN_SESSION_KEY, "true")
}

export const clearAdminSession = () => {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(ADMIN_SESSION_KEY)
}
