"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Star, Clock, Users, Sparkles, Award, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/ProductCard"
import { orderService, productService, type Product, type Order } from "@/lib/firebase-services"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import ScooterAnimation from "@/components/ScooterAnimation"

const HomePage: React.FC = () => {
  const { user } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [activeOrderLoading, setActiveOrderLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  useEffect(() => {
    if (user) {
      setActiveOrderLoading(true)
      const unsubscribe = orderService.subscribeToUserOrders(user.uid, (orders) => {
        const active = orders.find(
          (order) =>
            order.status === "CONFIRMED" ||
            order.status === "PREPARING" ||
            order.status === "PICKUP" ||
            order.status === "DELIVERY",
        )
        setActiveOrder(active || null)
        setActiveOrderLoading(false)
      })
      return () => unsubscribe()
    } else {
      setActiveOrder(null)
      setActiveOrderLoading(false)
    }
  }, [user])

  const loadFeaturedProducts = async () => {
    try {
      const products = await productService.getAllProducts()
      setFeaturedProducts(products.slice(0, 4))
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { icon: Users, value: "5000+", label: "Happy Customers", color: "text-orange-400" },
    { icon: Clock, value: "30min", label: "Average Delivery", color: "text-orange-500" },
    { icon: Star, value: "4.8★", label: "Customer Rating", color: "text-orange-300" },
  ]

  const features = [
    {
      icon: Sparkles,
      title: "Authentic Recipes",
      description: "Traditional recipes passed down through generations with authentic spices and techniques",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      icon: Award,
      title: "Premium Ingredients",
      description: "Only the finest basmati rice, fresh meat, and aromatic spices sourced directly",
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      icon: Truck,
      title: "Lightning Fast Delivery",
      description: "Hot, fresh favorites delivered to your doorstep in under 30 minutes guaranteed",
      color: "bg-secondary/10 text-secondary border-secondary/20",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/16743486/pexels-photo-16743486.jpeg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 z-10" />

        <div className="container-custom z-20 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-6"
            >
              <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-4 py-2 mb-4 animate-glow">
                Freshly Cooked Favorites Every Day
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 text-balance"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
            >
              <span className="text-primary neon-text animate-float">Vaibhav</span> Resto
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed text-pretty max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              Experience the signature flavors of Vaibhav Resto, from aromatic biryanis to comforting restaurant
              classics crafted with love, tradition, and bold spices.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <Link href="/menu">
                <Button size="lg" className="btn-primary text-lg px-8 py-4 h-auto animate-glow">
                  Order Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            {!activeOrderLoading && activeOrder && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 max-w-md mx-auto"
              >
                <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 text-primary-foreground shadow-lg">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Pass status prop to ScooterAnimation */}
                     <ScooterAnimation
  className="w-12 h-12"
  status={
    activeOrder.status === "PICKUP" || activeOrder.status === "DELIVERY"
      ? "OUT_FOR_DELIVERY"
      : activeOrder.status
  }
/>
                      <div>
                        <p className="text-sm font-medium">Active Order: #{activeOrder.id.substring(0, 6)}</p>
                        <p className="text-lg font-bold">{activeOrder.status}</p>
                      </div>
                    </div>
                    <Link href={`/orders/${activeOrder.id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        View Order
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-8 max-w-2xl md:max-w-3xl mx-auto mt-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center glass-effect-orange rounded-lg md:rounded-xl p-2 md:p-6"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-center mb-2 md:mb-4">
                    <div className={`p-1 md:p-3 rounded-full bg-black/30 ${stat.color}`}>
                      <stat.icon className="w-4 h-4 md:w-8 md:h-8" />
                    </div>
                  </div>
                  <div className="text-lg md:text-3xl font-heading font-bold text-primary mb-1 md:mb-2 animate-pulse-orange">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-base text-orange-200 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-muted/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 animate-glow">Our Specialties</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 text-balance">
              Our <span className="text-primary neon-text">Signature</span> Favorites
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              Every dish is crafted with premium ingredients and kitchen traditions that make Vaibhav Resto special.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-xl h-64 mb-4"></div>
                  <div className="bg-muted rounded h-4 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/menu">
              <Button size="lg" className="btn-primary animate-glow">
                View Full Menu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-4 animate-glow">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-balance">
              Why Choose <span className="text-primary neon-text">Vaibhav Resto</span>?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className={`h-full card-hover border-2 shadow-lg ${feature.color}`}>
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 animate-float`}
                    >
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-vibrant text-white">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-balance neon-text">
              Ready to Order from Vaibhav Resto?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
              Free delivery on your first 5 orders! Join thousands of satisfied customers today.
            </p>
            <Link href="/menu">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-4 h-auto bg-black text-primary hover:bg-black/90 animate-glow"
              >
                Order Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
