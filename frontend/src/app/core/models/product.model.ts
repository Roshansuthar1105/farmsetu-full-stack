export type ProductCategory =
  | 'SEEDS' | 'FERTILIZERS' | 'TOOLS' | 'EQUIPMENT' | 'PESTICIDES' | 'ORGANIC_PRODUCTS';

export interface Product {
  id: number;
  sellerId: number;
  sellerName: string;
  title: string;
  description?: string;
  category: ProductCategory;
  price: number;
  quantity?: number;
  unit?: string;
  condition: 'NEW' | 'USED';
  images: string[];
  location?: string;
  auction: boolean;
  auctionEndTime?: string;
  currentBid?: number;
  startingBid?: number;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  stock: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lowStockThreshold: number;
  averageRating?: number;
  totalReviews?: number;
  starDistribution?: Record<number, number>;
}
