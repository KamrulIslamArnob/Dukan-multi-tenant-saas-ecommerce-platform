import { http } from "@/lib/http";
import { localStorageService } from "@/lib/local-storage.service";
import type {
  AdminStatsDto,
  TenantAdminDto,
  MerchantAdminDto,
  CustomerAdminDto,
  AdminOrderSummaryDto,
  CreateMerchantDto,
  CreateTenantDto,
  UpdateMerchantDto,
  UpdateTenantDto,
  CreateCustomerDto,
  UpdateCustomerDto,
  PaginationRequest,
  PagedResponse,
} from "./types";

function adminHeaders(): HeadersInit {
  const token = localStorageService.getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminApi = {
  getStats: () =>
    http<AdminStatsDto>("/api/admin/stats", { headers: adminHeaders() }),

  getTenants: (params: PaginationRequest) =>
    http<PagedResponse<TenantAdminDto>>(
      `/api/admin/tenants?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`,
      { headers: adminHeaders() }
    ),

  getTenant: (id: string) =>
    http<TenantAdminDto>(`/api/admin/tenants/${id}`, {
      headers: adminHeaders(),
    }),

  createTenant: (dto: CreateTenantDto) =>
    http<TenantAdminDto>("/api/admin/tenants", {
      method: "POST",
      body: JSON.stringify(dto),
      headers: adminHeaders(),
    }),

  updateTenant: (dto: UpdateTenantDto) =>
    http<TenantAdminDto>(`/api/admin/tenants/${dto.tenantId}`, {
      method: "PUT",
      body: JSON.stringify(dto),
      headers: adminHeaders(),
    }),

  deleteTenant: (id: string) =>
    http<void>(`/api/admin/tenants/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    }),

  getMerchants: (params: PaginationRequest) =>
    http<PagedResponse<MerchantAdminDto>>(
      `/api/admin/merchants?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`,
      { headers: adminHeaders() }
    ),

  getMerchant: (id: string) =>
    http<MerchantAdminDto>(`/api/admin/merchants/${id}`, {
      headers: adminHeaders(),
    }),

  createMerchant: (dto: CreateMerchantDto) =>
    http<MerchantAdminDto>("/api/admin/merchants", {
      method: "POST",
      body: JSON.stringify(dto),
      headers: adminHeaders(),
    }),

  updateMerchant: (dto: UpdateMerchantDto) =>
    http<MerchantAdminDto>(`/api/admin/merchants/${dto.userId}`, {
      method: "PUT",
      body: JSON.stringify(dto),
      headers: adminHeaders(),
    }),

  deleteMerchant: (id: string) =>
    http<void>(`/api/admin/merchants/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    }),

  getCustomers: (params: PaginationRequest) =>
    http<PagedResponse<CustomerAdminDto>>(
      `/api/admin/customers?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`,
      { headers: adminHeaders() }
    ),

  getCustomer: (id: string) =>
    http<CustomerAdminDto>(`/api/admin/customers/${id}`, {
      headers: adminHeaders(),
    }),

  createCustomer: (dto: CreateCustomerDto) =>
    http<CustomerAdminDto>("/api/admin/customers", {
      method: "POST",
      body: JSON.stringify(dto),
      headers: adminHeaders(),
    }),

  updateCustomer: (dto: UpdateCustomerDto) =>
    http<CustomerAdminDto>(`/api/admin/customers/${dto.userId}`, {
      method: "PUT",
      body: JSON.stringify(dto),
      headers: adminHeaders(),
    }),

  deleteCustomer: (id: string) =>
    http<void>(`/api/admin/customers/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    }),

  getOrders: (params: PaginationRequest) =>
    http<PagedResponse<AdminOrderSummaryDto>>(
      `/api/admin/orders?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`,
      { headers: adminHeaders() }
    ),

  getOrder: (id: string) =>
    http<AdminOrderSummaryDto>(`/api/admin/orders/${id}`, {
      headers: adminHeaders(),
    }),

  cancelOrder: (id: string) =>
    http<void>(`/api/admin/orders/${id}/cancel`, {
      method: "PUT",
      headers: adminHeaders(),
    }),
};
