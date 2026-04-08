"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, CreateCategoryPayload } from "@/types/habitaciones";
import {
  getCategories,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from "@/services/apiHabitaciones";

export function useCategories(token: string, propertyId: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories(token, propertyId);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [token, propertyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createCategory = useCallback(
    async (payload: CreateCategoryPayload) => {
      const created = await apiCreateCategory(token, propertyId, payload);
      setCategories((prev) => [...prev, created]);
    },
    [token, propertyId],
  );

  const updateCategory = useCallback(
    async (categoryId: string, payload: Partial<CreateCategoryPayload>) => {
      const updated = await apiUpdateCategory(
        token,
        propertyId,
        categoryId,
        payload,
      );
      setCategories((prev) =>
        prev.map((c) => (c.categoryId === categoryId ? updated : c)),
      );
    },
    [token, propertyId],
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      await apiDeleteCategory(token, propertyId, categoryId);
      setCategories((prev) =>
        prev.filter((c) => c.categoryId !== categoryId),
      );
    },
    [token, propertyId],
  );

  return {
    categories,
    loading,
    error,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
