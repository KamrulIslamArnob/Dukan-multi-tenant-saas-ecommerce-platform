import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "./api";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "./types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });
}

export function useCategoriesDropdown() {
  return useQuery({
    queryKey: ["categories", "dropdown"],
    queryFn: () => categoriesApi.getDropdown(),
  });
}

export function useCreateCategory(onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess();
    },
  });
}

export function useUpdateCategory(onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess();
    },
  });
}

export function useDeleteCategory(onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess();
    },
  });
}
