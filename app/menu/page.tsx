"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Filter, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductCard from "@/components/ProductCard"
import { productService, type Product } from "@/lib/firebase-services"

const MenuPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating">("name")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const allProducts = await productService.getAllProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: "all", name: "All Items", count: products.length },
    { id: "veg", name: "Vegetarian", count: products.filter((p) => p.isVeg).length },
    { id: "non-veg", name: "Non-Vegetarian", count: products.filter((p) => !p.isVeg).length },
  ]

  const filteredProducts = products
    .filter((product) => {
      // Category filter
      if (selectedCategory === "veg" && !product.isVeg) return false
      if (selectedCategory === "non-veg" && product.isVeg) return false

      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price
        case "rating":
          return b.rating - a.rating
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* <section className="relative py-20 overflow-hidden bg-gradient-primary">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20"
          style={{
            backgroundImage: "url(https://images.pexels.com/photos/8753453/pexels-photo-8753453.jpeg)",
          }}
        />

        <div className="container-custom z-20 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center text-white">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">Our Complete Menu</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-balance">
              Discover Our <span className="text-white">Authentic</span> Biryanis
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto text-pretty">
              Each dish is crafted with traditional recipes, premium ingredients, and generations of culinary expertise
            </p>
          </motion.div>
        </div>
      </section> */}

      <div className="container-custom py-12">
        {/* Search and Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mb-8">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for biryani..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Category and Sort Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={
                    selectedCategory === category.id
                      ? "btn-primary"
                      : "border-border hover:border-primary hover:text-primary"
                  }
                >
                  {category.name}
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${
                      selectedCategory === category.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="rating">Sort by Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading delicious biryanis...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">No biryanis found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" layout>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && filteredProducts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-12">
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} biryanis
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default MenuPage
