import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "./api";
import type { PaginationRequest, CreateMerchantDto, CreateTenantDto, UpdateMerchantDto, UpdateTenantDto, CreateCustomerDto, UpdateCustomerDto } from "./types";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminTenants(params: PaginationRequest) {
  return useQuery({
    queryKey: ["admin", "tenants", params],
    queryFn: () => adminApi.getTenants(params),
  });
}

export function useAdminTenant(id: string) {
  return useQuery({
    queryKey: ["admin", "tenants", id],
    queryFn: () => adminApi.getTenant(id),
    enabled: !!id,
  });
}

export function useAdminMerchants(params: PaginationRequest) {
  return useQuery({
    queryKey: ["admin", "merchants", params],
    queryFn: () => adminApi.getMerchants(params),
  });
}

export function useAdminMerchant(id: string) {
  return useQuery({
    queryKey: ["admin", "merchants", id],
    queryFn: () => adminApi.getMerchant(id),
    enabled: !!id,
  });
}

export function useAdminCustomers(params: PaginationRequest) {
  return useQuery({
    queryKey: ["admin", "customers", params],
    queryFn: () => adminApi.getCustomers(params),
  });
}

export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: ["admin", "customers", id],
    queryFn: () => adminApi.getCustomer(id),
    enabled: !!id,
  });
}

export function useAdminOrders(params: PaginationRequest) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: () => adminApi.getOrders(params),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: () => adminApi.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTenantDto) => adminApi.createTenant(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateMerchantDto) => adminApi.updateMerchant(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "merchants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "merchants", variables.userId] });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTenantDto) => adminApi.updateTenant(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants", variables.tenantId] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteMerchant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "merchants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useCreateMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMerchantDto) => adminApi.createMerchant(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "merchants"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => adminApi.createCustomer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCustomerDto) => adminApi.updateCustomer(dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "customers", variables.userId] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.cancelOrder(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", id] });
    },
  });
}
