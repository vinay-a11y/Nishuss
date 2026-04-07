export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  cookingTime: string;
  isVeg: boolean;
  spiceLevel: 'MILD' | 'MEDIUM' | 'SPICY';
  rating: number;
  reviews: number;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic basmati rice layered with tender chicken and traditional spices',
    price: 299,
    image: 'https://images.pexels.com/photos/16743486/pexels-photo-16743486.jpeg',
    category: 'Non-Veg',
    cookingTime: '25 min',
    isVeg: false,
    spiceLevel: 'MEDIUM',
    rating: 4.8,
    reviews: 324
  },
  {
    id: '2',
    name: 'Lucknowi Mutton Biryani',
    description: 'Slow-cooked mutton with fragrant rice in traditional dum style',
    price: 399,
    image: 'https://images.pexels.com/photos/15146310/pexels-photo-15146310.jpeg',
    category: 'Non-Veg',
    cookingTime: '35 min',
    isVeg: false,
    spiceLevel: 'MEDIUM',
    rating: 4.9,
    reviews: 256
  },
  {
    id: '3',
    name: 'Vegetable Biryani',
    description: 'Mixed vegetables and paneer cooked with basmati rice and spices',
    price: 249,
    image: 'https://images.pexels.com/photos/8753453/pexels-photo-8753453.jpeg',
    category: 'Veg',
    cookingTime: '20 min',
    isVeg: true,
    spiceLevel: 'MILD',
    rating: 4.6,
    reviews: 189
  },
  {
    id: '4',
    name: 'Prawns Biryani',
    description: 'Fresh prawns marinated in coastal spices with fragrant rice',
    price: 349,
    image: 'https://images.pexels.com/photos/15146328/pexels-photo-15146328.jpeg',
    category: 'Non-Veg',
    cookingTime: '30 min',
    isVeg: false,
    spiceLevel: 'SPICY',
    rating: 4.7,
    reviews: 142
  },
  {
    id: '5',
    name: 'Fish Biryani',
    description: 'Fresh fish cooked with aromatic spices and basmati rice',
    price: 329,
    image: 'https://images.pexels.com/photos/8753437/pexels-photo-8753437.jpeg',
    category: 'Non-Veg',
    cookingTime: '28 min',
    isVeg: false,
    spiceLevel: 'MEDIUM',
    rating: 4.5,
    reviews: 198
  },
  {
    id: '6',
    name: 'Paneer Biryani',
    description: 'Cottage cheese cubes with aromatic basmati rice and mild spices',
    price: 279,
    image: 'https://images.pexels.com/photos/8753462/pexels-photo-8753462.jpeg',
    category: 'Veg',
    cookingTime: '22 min',
    isVeg: true,
    spiceLevel: 'MILD',
    rating: 4.4,
    reviews: 167
  }
];

export const categories = [
  { id: 'all', name: 'All Items', count: mockProducts.length },
  { id: 'veg', name: 'Vegetarian', count: mockProducts.filter(p => p.isVeg).length },
  { id: 'non-veg', name: 'Non-Vegetarian', count: mockProducts.filter(p => !p.isVeg).length }
];