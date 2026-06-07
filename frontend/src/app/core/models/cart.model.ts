export interface CartItem {
  id: number;
  productId: number;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  requestedQuantity: number;
  availableStock: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  warning: 'NONE' | 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'LOW_STOCK';
}

export interface CartResponse {
  items: CartItem[];
  totalAmount: number;
}
