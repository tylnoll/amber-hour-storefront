export type ProductCategory = "honey" | "tea" | "candles" | "balms-roll-ons" | "bundles";

export type ProductVariant = {
  id: string;
  name: string;
  price?: number;
};

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
  inventoryQuantity: number;
  imageAlt: string;
  images: string[];
  variants: ProductVariant[];
};

export type SaleSettings = {
  active: boolean;
  percentOff: number;
  label: string;
};

export type StoreSettings = {
  announcement: string;
  sale: SaleSettings;
  lowStockThreshold: number;
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
  availabilityNote: string;
  isSoldOut: boolean;
  isLowStock: boolean;
};

export type CartLine = {
  productId: string;
  variantId: string;
  productName: string;
  unitPriceDisplay: string;
  quantity: number;
};

export type CustomerOrderLine = {
  description: string;
  quantity: number;
  amountTotal: number;
};

export type CustomerOrder = {
  id: string;
  createdAt: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  checkoutStatus: string;
  lineItems: CustomerOrderLine[];
};

export type CustomerAccountRecord = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  createdIp: string;
  createdIpSource?: string;
  lastIp?: string;
  lastIpSource?: string;
  pointsAdjustment?: number;
  banned: boolean;
  banReason?: string;
};

export type CustomerAccountSummary = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  createdIp: string;
  createdIpSource?: string;
  lastIp?: string;
  lastIpSource?: string;
  banned: boolean;
  banReason?: string;
  points: number;
  totalOrders: number;
};

export type CustomerDashboard = {
  account: CustomerAccountSummary;
  orders: CustomerOrder[];
  points: number;
  firstOrderOfferEligible: boolean;
};

export type AdminAccountDetail = {
  account: CustomerAccountSummary;
  orders: CustomerOrder[];
  pointsAdjustment: number;
  firstOrderOfferEligible: boolean;
};
