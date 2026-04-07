"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import AdminNavigation from "@/components/admin/AdminNavigation"
import ProductFormDialog from "@/components/admin/ProductFormDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { hasAdminSession } from "@/lib/admin-auth"
import { productService, type Product, type ProductFormData } from "@/lib/firebase-services"

const AdminProductsPage: React.FC = () => {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  useEffect(() => {
    if (!hasAdminSession()) {
      router.replace("/admin")
      return
    }

    setAuthorized(true)
    const unsubscribe = productService.subscribeToAllProducts((items) => {
      setProducts(items)
      setLoading(false)
      setRefreshing(false)
    })

    return () => unsubscribe()
  }, [router])

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) =>
      [product.name, product.category, product.description].some((value) => value.toLowerCase().includes(query)),
    )
  }, [products, searchQuery])

  const availableCount = products.filter((product) => product.available).length
  const unavailableCount = products.length - availableCount

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const items = await productService.getAllProductsForAdmin()
      setProducts(items)
    } catch (error) {
      console.error("Error refreshing products:", error)
      toast.error("Failed to refresh products")
    } finally {
      setRefreshing(false)
    }
  }

  const handleCreateOrUpdate = async (values: ProductFormData) => {
    setSavingProduct(true)

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, values)
        toast.success("Product updated")
      } else {
        await productService.createProduct(values)
        toast.success("Product created")
      }

      setDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Failed to save product")
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete "${product.name}" from the menu?`)
    if (!confirmed) return

    setDeletingProductId(product.id)
    try {
      await productService.deleteProduct(product.id)
      toast.success("Product deleted")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    } finally {
      setDeletingProductId(null)
    }
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading admin products...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background pt-20">
        <div className="container-custom py-8 space-y-8">
          <AdminNavigation
            title="Vaibhav Resto Products"
            description="Add new dishes, update menu details, and control what is visible on the storefront."
            actions={
              <>
                <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription>Total Products</CardDescription>
                <CardTitle className="text-3xl">{products.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription>Available Now</CardDescription>
                <CardTitle className="text-3xl">{availableCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription>Hidden / Unavailable</CardDescription>
                <CardTitle className="text-3xl">{unavailableCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-primary/20">
            <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Products Table</CardTitle>
                <CardDescription>Manage pricing, category, spice level, and availability.</CardDescription>
              </div>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="md:max-w-xs"
              />
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No products matched your search.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Spice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover border"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.isVeg ? "Veg" : "Non-Veg"}</Badge>
                        </TableCell>
                        <TableCell>Rs. {product.price}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.spiceLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={product.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {product.available ? "Available" : "Hidden"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.rating} / 5
                          <div className="text-xs text-muted-foreground">{product.reviews} reviews</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              disabled={deletingProductId === product.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingProductId === product.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
        saving={savingProduct}
        onSubmit={handleCreateOrUpdate}
      />
    </>
  )
}

export default AdminProductsPage
