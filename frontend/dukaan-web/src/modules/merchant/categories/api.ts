import { http } from "@/lib/http";
import { localStorageService } from "@/lib/local-storage.service";
import type { Category, CategoryDropdownItem, CreateCategoryRequest, UpdateCategoryRequest, PagedResponse } from "./types";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorageService.getToken()}`,
});

export const categoriesApi = {
  getAll: () =>
    http<PagedResponse<Category>>(`/api/categories?pageNumber=1&pageSize=50`, {
      headers: authHeaders(),
    }),

  getDropdown: () =>
    http<CategoryDropdownItem[]>(`/api/categories/dropdown`, {
      headers: authHeaders(),
    }),

  create: (data: CreateCategoryRequest) =>
    http<Category>(`/api/categories`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCategoryRequest) =>
    http<void>(`/api/categories/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    http<void>(`/api/categories/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};
