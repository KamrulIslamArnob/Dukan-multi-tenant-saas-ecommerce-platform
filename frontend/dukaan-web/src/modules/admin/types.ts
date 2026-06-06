export type OrderStatus = "Pending" | "Confirmed" | "Cancelled";

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface AdminStatsDto {
  totalTenants: number;
  totalMerchants: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: OrderStatusCount[];
  revenueLast30Days: DailyRevenue[];
}

export interface TenantAdminDto {
  id: string;
  storeName: string;
  slug: string;
  merchantEmail: string | null;
  createdAt: string;
  productCount: number;
  orderCount: number;
  revenue: number;
  category: string;
  country: string;
  currency: string;
}

export interface MerchantAdminDto {
  id: string;
  email: string;
  storeName: string;
  slug: string;
  registeredAt: string;
  productCount: number;
  orderCount: number;
}

export interface CustomerAdminDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  storeSlug: string;
  registeredAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface AdminOrderSummaryDto {
  id: string;
  orderNumber: string;
  storeName: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface CreateMerchantDto {
  email: string;
  password: string;
  tenantId: string;
}

export interface CreateTenantDto {
  storeName: string;
  slug: string;
  category?: string;
  country?: string;
  currency?: string;
}

export interface UpdateMerchantDto {
  userId: string;
  storeName: string;
  slug: string;
}

export interface UpdateTenantDto {
  tenantId: string;
  storeName: string;
  slug: string;
  category: string;
  country: string;
  currency: string;
}

export interface CreateCustomerDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string;
}

export interface UpdateCustomerDto {
  userId: string;
  firstName: string;
  lastName: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
