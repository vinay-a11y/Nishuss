"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Minus, ShoppingCart, Star, ArrowLeft, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { productService, type Product } from "@/lib/firebase-services"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext" // Assuming a CartContext exists

interface ProductDetailsPageProps {
  params: {
    productId: string
  }
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ params }) => {
  const { productId } = params
  const router = useRouter()
  const { addToCart } = useCart() // Assuming useCart hook from CartContext
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Product ID is missing.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const fetchedProduct = await productService.getProduct(productId)
        if (fetchedProduct) {
          setProduct(fetchedProduct)
        } else {
          setError("Product not found.")
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
      })
      router.push("/cart") // Redirect to cart page after adding
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-xl mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.back()} className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-xl mb-2">Product Not Found</h3>
          <p className="text-muted-foreground mb-4">The product you are looking for does not exist.</p>
          <Button onClick={() => router.back()} className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-4 md:pb-8">
      <div className="container-custom px-2 md:px-4 py-4 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </Button>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-center flex-1">
            Product <span className="text-primary neon-text">Details</span>
          </h1>
          <div className="w-8 md:w-10"></div> {/* Placeholder for alignment */}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
          <Card className="card-hover">
            <CardContent className="p-0">
              <div className="relative w-full h-64 md:h-80 rounded-t-lg overflow-hidden">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold">{product.name}</h2>
                  <Badge className="bg-primary text-primary-foreground text-sm md:text-base">₹{product.price}</Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base mb-4">{product.description}</p>

                <div className="flex items-center space-x-4 mb-4">
                  <Badge variant="outline" className="text-sm md:text-base">
                    {product.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                  </Badge>
                  <Badge variant="outline" className="text-sm md:text-base">
                    {product.spiceLevel}
                  </Badge>
                  <Badge variant="outline" className="text-sm md:text-base">
                    {product.cookingTime}
                  </Badge>
                </div>

                <div className="flex items-center mb-4">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm md:text-base font-medium">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 md:w-10 md:h-10"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl md:text-2xl font-bold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-8 h-8 md:w-10 md:h-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button onClick={handleAddToCart} className="w-full btn-primary animate-glow text-base md:text-lg h-12">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - ₹{(product.price * quantity).toFixed(2)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
