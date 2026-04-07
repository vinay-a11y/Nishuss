import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

// Product interface
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  cookingTime: string
  isVeg: boolean
  spiceLevel: "MILD" | "MEDIUM" | "SPICY"
  rating: number
  reviews: number
  available: boolean
  createdAt: Timestamp
  updatedAt?: Timestamp
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  image: string
  category: string
  cookingTime: string
  isVeg: boolean
  spiceLevel: Product["spiceLevel"]
  rating: number
  reviews: number
  available: boolean
}

// User interface
export interface UserProfile {
  id: string
  name: string
  phoneNumber: string
  email?: string
  addresses: Address[]
  defaultAddressId?: string
  orderCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Address interface
export interface Address {
  id: string
  type: "HOME" | "WORK" | "OTHER"
  street: string
  area: string
  city: string
  state: string
  pincode: string
  landmark?: string
  isDefault: boolean
}

// Order interface
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  deliveryFee: number
  finalAmount: number
  status: "CONFIRMED" | "PREPARING" | "PICKUP" | "DELIVERY" | "DELIVERED" | "CANCELLED"
  deliveryAddress: Address
  paymentId?: string  
  razorpayOrderId?: string // Added razorpayOrderId field
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED"
  estimatedDeliveryTime: number // in minutes
  createdAt: Timestamp
  updatedAt: Timestamp
  statusHistory: OrderStatusUpdate[]
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface OrderStatusUpdate {
  status: Order["status"]
  timestamp: Timestamp
  message: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: "NEW" | "REVIEWED" | "RESOLVED"
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Product Services
export const productService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, "products")
      const q = query(productsRef, where("available", "==", true), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
    } catch (error) {
      console.error("Error fetching products:", error)
      return []
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, "products")
      const q = query(
        productsRef,
        where("available", "==", true),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
    } catch (error) {
      console.error("Error fetching products by category:", error)
      return []
    }
  },

  // Get single product
  async getProduct(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, "products", id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product
      }
      return null
    } catch (error) {
      console.error("Error fetching product:", error)
      return null
    }
  },

  async getAllProductsForAdmin(): Promise<Product[]> {
    try {
      const productsRef = collection(db, "products")
      const q = query(productsRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
    } catch (error) {
      console.error("Error fetching admin products:", error)
      return []
    }
  },

  async createProduct(productData: ProductFormData): Promise<string> {
    try {
      const productsRef = collection(db, "products")
      const docRef = await addDoc(productsRef, {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  },

  async updateProduct(productId: string, productData: Partial<ProductFormData>): Promise<void> {
    try {
      const productRef = doc(db, "products", productId)
      await updateDoc(productRef, {
        ...productData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, "products", productId)
      await deleteDoc(productRef)
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  },

  subscribeToAllProducts(callback: (products: Product[]) => void): Unsubscribe {
    try {
      const productsRef = collection(db, "products")
      const q = query(productsRef, orderBy("createdAt", "desc"))

      return onSnapshot(
        q,
        (snapshot) => {
          const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
          callback(products)
        },
        (error) => {
          console.error("Error in products subscription:", error)
          callback([])
        },
      )
    } catch (error) {
      console.error("Error setting up products subscription:", error)
      return () => {}
    }
  },
}

// User Services
export const userService = {
  // Create or update user profile
  async createOrUpdateUser(userId: string, userData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          ...userData,
          updatedAt: serverTimestamp(),
        })
      } else {
        await updateDoc(userRef, {
          id: userId,
          orderCount: 0,
          addresses: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...userData,
        })
      }
    } catch (error) {
      console.error("Error creating/updating user:", error)
      throw error
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as UserProfile
      }
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  },

  // Add address (max 3)
  async addAddress(userId: string, address: Omit<Address, "id">): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile
        const addresses = userData.addresses || []

        if (addresses.length >= 3) {
          throw new Error("Maximum 3 addresses allowed")
        }

        const newAddress: Address = {
          ...address,
          id: `addr_${Date.now()}`,
          isDefault: addresses.length === 0, // First address is default
        }

        const updatedAddresses = [...addresses, newAddress]

        await updateDoc(userRef, {
          addresses: updatedAddresses,
          defaultAddressId: addresses.length === 0 ? newAddress.id : userData.defaultAddressId,
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error adding address:", error)
      throw error
    }
  },

  // Update address
  async updateAddress(userId: string, addressId: string, updates: Partial<Address>): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile
        const addresses = userData.addresses || []

        const updatedAddresses = addresses.map((addr) => (addr.id === addressId ? { ...addr, ...updates } : addr))

        await updateDoc(userRef, {
          addresses: updatedAddresses,
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error updating address:", error)
      throw error
    }
  },

  // Delete address
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile
        const addresses = userData.addresses || []

        const updatedAddresses = addresses.filter((addr) => addr.id !== addressId)

        // If deleted address was default, set first remaining as default
        let defaultAddressId = userData.defaultAddressId
        if (defaultAddressId === addressId && updatedAddresses.length > 0) {
          defaultAddressId = updatedAddresses[0].id
          updatedAddresses[0].isDefault = true
        }

        await updateDoc(userRef, {
          addresses: updatedAddresses,
          defaultAddressId: updatedAddresses.length > 0 ? defaultAddressId : null,
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      throw error
    }
  },
}

// Order Services
export const orderService = {
  // Create new order
  async createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "statusHistory">): Promise<string> {
    try {
      console.log("Creating order:", orderData)
      const ordersRef = collection(db, "orders")

      const now = new Date()
      const timestamp = now as unknown as Timestamp

      const newOrder = {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: [
          {
            status: "CONFIRMED" as const,
            timestamp: timestamp, // Use regular Date instead of serverTimestamp
            message: "Order confirmed successfully",
          },
        ],
      }

      console.log("Adding order to Firestore...")
      const docRef = await addDoc(ordersRef, newOrder)
      console.log("Order created with ID:", docRef.id)

      // Update user order count
      const userRef = doc(db, "users", orderData.userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile
        await updateDoc(userRef, {
          orderCount: (userData.orderCount || 0) + 1,
          updatedAt: serverTimestamp(),
        })
      }

      return docRef.id
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  },

  // Get user orders
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
    } catch (error) {
      console.error("Error fetching user orders:", error)
      return []
    }
  },

  // Get all orders for admin management
  async getAllOrders(): Promise<Order[]> {
    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
    } catch (error) {
      console.error("Error fetching all orders:", error)
      return []
    }
  },

  // Get single order
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, "orders", orderId)
      const orderSnap = await getDoc(orderRef)
      if (orderSnap.exists()) {
        return { id: orderSnap.id, ...orderSnap.data() } as Order
      }
      return null
    } catch (error) {
      console.error("Error fetching order:", error)
      return null
    }
  },

  // Update order
  async updateOrder(orderId: string, updateData: Partial<Order>): Promise<void> {
    if (!orderId) {
      throw new Error("Order ID is required")
    }

    try {
      const orderRef = doc(db, "orders", orderId)
      const orderSnap = await getDoc(orderRef)

      if (!orderSnap.exists()) {
        throw new Error("Order not found")
      }

      await updateDoc(orderRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating order:", error)
      throw error
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order["status"], message: string): Promise<void> {
    try {
      const orderRef = doc(db, "orders", orderId)
      const orderSnap = await getDoc(orderRef)

      if (orderSnap.exists()) {
        const orderData = orderSnap.data() as Order
        const statusHistory = orderData.statusHistory || []

        const now = new Date()
        const timestamp = now as unknown as Timestamp

        const newStatusUpdate: OrderStatusUpdate = {
          status,
          timestamp: timestamp,
          message,
        }

        await updateDoc(orderRef, {
          status,
          statusHistory: [...statusHistory, newStatusUpdate],
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  },

  subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void): Unsubscribe {
    try {
      console.log("[v0] Setting up subscription for user:", userId)
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

      return onSnapshot(
        q,
        (snapshot) => {
          console.log("[v0] Subscription received snapshot with", snapshot.docs.length, "docs")
          const orders = snapshot.docs.map((doc) => {
            const data = doc.data()
            console.log("[v0] Order data:", { id: doc.id, status: data.status, createdAt: data.createdAt })
            return { id: doc.id, ...data } as Order
          })
          callback(orders)
        },
        (error) => {
          console.error("[v0] Error in orders subscription:", error)
          callback([])
        },
      )
    } catch (error) {
      console.error("[v0] Error setting up orders subscription:", error)
      return () => {}
    }
  },

  subscribeToOrder(orderId: string, callback: (order: Order | null) => void): Unsubscribe {
    try {
      const orderRef = doc(db, "orders", orderId)

      return onSnapshot(
        orderRef,
        (doc) => {
          if (doc.exists()) {
            const order = { id: doc.id, ...doc.data() } as Order
            callback(order)
          } else {
            callback(null)
          }
        },
        (error) => {
          console.error("Error in order subscription:", error)
          callback(null)
        },
      )
    } catch (error) {
      console.error("Error setting up order subscription:", error)
      return () => {}
    }
  },
}

export const contactService = {
  async createSubmission(data: Omit<ContactSubmission, "id" | "status" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const contactsRef = collection(db, "contactSubmissions")
      const docRef = await addDoc(contactsRef, {
        ...data,
        status: "NEW",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return docRef.id
    } catch (error) {
      console.error("Error creating contact submission:", error)
      throw error
    }
  },

  async getAllSubmissions(): Promise<ContactSubmission[]> {
    try {
      const contactsRef = collection(db, "contactSubmissions")
      const q = query(contactsRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ContactSubmission)
    } catch (error) {
      console.error("Error fetching contact submissions:", error)
      return []
    }
  },

  async updateSubmissionStatus(submissionId: string, status: ContactSubmission["status"]): Promise<void> {
    try {
      const submissionRef = doc(db, "contactSubmissions", submissionId)
      await updateDoc(submissionRef, {
        status,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating contact submission status:", error)
      throw error
    }
  },

  subscribeToSubmissions(callback: (submissions: ContactSubmission[]) => void): Unsubscribe {
    try {
      const contactsRef = collection(db, "contactSubmissions")
      const q = query(contactsRef, orderBy("createdAt", "desc"))

      return onSnapshot(
        q,
        (snapshot) => {
          const submissions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ContactSubmission)
          callback(submissions)
        },
        (error) => {
          console.error("Error in contact submissions subscription:", error)
          callback([])
        },
      )
    } catch (error) {
      console.error("Error setting up contact submissions subscription:", error)
      return () => {}
    }
  },
}
