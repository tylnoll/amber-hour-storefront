export type ProductCategory = "honey" | "tea" | "candles" | "balms-roll-ons" | "bundles";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  ingredients: string[];
  howToUse: string;
  potencyMgCBD: number;
  thcPercent: string;
  batchNumber: string;
  coaPdfUrl: string;
  bestSeller?: boolean;
  recommended?: boolean;
  basePrice: number;
  imageAlt: string;
  images: string[];
  variants: Array<{ id: string; name: string }>;
};

export type SaleSettings = {
  active: boolean;
  percentOff: number;
  label: string;
};

export type StoreSettings = {
  announcement: string;
  sale: SaleSettings;
};

export type StoreData = {
  products: Product[];
  settings: StoreSettings;
  updatedAt: string;
};

export type AdminProfile = {
  username: string;
  displayName: string;
  rank: string;
  roles: string[];
  permissions: string[];
};

export type SyncedStripeOrder = {
  sessionId: string;
  createdAt: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  checkoutStatus: string;
  customerEmail: string;
  mode: string;
  url: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    amountTotal: number;
  }>;
};

export type ProductForDisplay = Product & {
  displayPrice: string;
  sortPrice: number;
  saleApplied: boolean;
  originalPrice?: string;
};

export type CartLine = {
  productId: string;
  variantId: string;
  productName: string;
  unitPriceDisplay: string;
  quantity: number;
};
