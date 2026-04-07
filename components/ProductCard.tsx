"use client"

import type React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Clock, Star, Plus, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/firebase-services"
import { useCart } from "@/contexts/CartContext"
import toast from "react-hot-toast"

interface ProductCardProps {
  product: Product
  index?: number
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1, // Default quantity to 1 when adding to cart
    })
    toast.success(`${product.name} added to cart!`)
  }

  const getSpiceLevelColor = (level: string) => {
    switch (level) {
      case "MILD":
        return "bg-green-100 text-green-700 border-green-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "SPICY":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden group card-hover border-0 shadow-lg bg-card">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge
              className={`${product.isVeg ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white border-0 shadow-sm`}
            >
              <Leaf className="w-3 h-3 mr-1" />
              {product.isVeg ? "VEG" : "NON-VEG"}
            </Badge>
            <Badge className={`${getSpiceLevelColor(product.spiceLevel)} text-xs font-medium`}>
              {product.spiceLevel}
            </Badge>
          </div>

          {/* Cooking time */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-black/80 text-white border-0 backdrop-blur-sm">
              <Clock className="w-3 h-3 mr-1" />
              {product.cookingTime}
            </Badge>
          </div>

          {/* Rating overlay */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge className="bg-white/90 text-black border-0 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
              {product.rating}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-heading font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 mr-2">
              {product.name}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground shrink-0">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-xs">({product.reviews})</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-heading font-bold text-primary">₹{product.price}</span>
              <span className="text-xs text-muted-foreground">+ taxes</span>
            </div>
            <Button onClick={handleAddToCart} className="btn-primary shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ProductCard
