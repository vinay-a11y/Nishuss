"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Product, ProductFormData } from "@/lib/firebase-services"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  saving: boolean
  onSubmit: (values: ProductFormData) => Promise<void> | void
}

const defaultValues: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  cookingTime: "30 mins",
  isVeg: false,
  spiceLevel: "MEDIUM",
  rating: 4.5,
  reviews: 0,
  available: true,
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({ open, onOpenChange, product, saving, onSubmit }) => {
  const [formData, setFormData] = useState<ProductFormData>(defaultValues)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        cookingTime: product.cookingTime,
        isVeg: product.isVeg,
        spiceLevel: product.spiceLevel,
        rating: product.rating,
        reviews: product.reviews,
        available: product.available,
      })
      return
    }

    setFormData(defaultValues)
  }, [product, open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit(formData)
  }

  const setField = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>Manage the product information shown in the Vaibhav Resto menu.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Chicken Biryani"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Input
                id="product-category"
                value={formData.category}
                onChange={(event) => setField("category", event.target.value)}
                placeholder="Biryani"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={formData.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Describe the dish"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image">Image URL</Label>
            <Input
              id="product-image"
              value={formData.image}
              onChange={(event) => setField("image", event.target.value)}
              placeholder="https://example.com/dish.jpg"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={(event) => setField("price", Number(event.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-cooking-time">Cooking Time</Label>
              <Input
                id="product-cooking-time"
                value={formData.cookingTime}
                onChange={(event) => setField("cookingTime", event.target.value)}
                placeholder="30 mins"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Spice Level</Label>
              <Select value={formData.spiceLevel} onValueChange={(value: Product["spiceLevel"]) => setField("spiceLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select spice level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MILD">Mild</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="SPICY">Spicy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="product-rating">Rating</Label>
              <Input
                id="product-rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(event) => setField("rating", Number(event.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-reviews">Reviews</Label>
              <Input
                id="product-reviews"
                type="number"
                min="0"
                step="1"
                value={formData.reviews}
                onChange={(event) => setField("reviews", Number(event.target.value))}
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Vegetarian</p>
                <p className="text-sm text-muted-foreground">Show veg badge</p>
              </div>
              <Switch checked={formData.isVeg} onCheckedChange={(checked) => setField("isVeg", checked)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Available</p>
                <p className="text-sm text-muted-foreground">Visible on menu</p>
              </div>
              <Switch checked={formData.available} onCheckedChange={(checked) => setField("available", checked)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProductFormDialog
