"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CreateUnitPayload,
  Unit,
  UnitStatus,
} from "@/types/habitaciones";
import {
  getUnits,
  createUnit as apiCreateUnit,
  updateUnit as apiUpdateUnit,
  updateUnitStatus as apiUpdateUnitStatus,
  deleteUnit as apiDeleteUnit,
} from "@/services/apiHabitaciones";

export function useUnitsList(token: string, propertyId: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUnits(token, propertyId);
      setUnits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [token, propertyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createUnit = useCallback(
    async (payload: CreateUnitPayload) => {
      const created = await apiCreateUnit(token, propertyId, payload);
      setUnits((prev) => [...prev, created]);
    },
    [token, propertyId],
  );

  const updateUnit = useCallback(
    async (unitId: string, payload: Partial<CreateUnitPayload>) => {
      const updated = await apiUpdateUnit(token, propertyId, unitId, payload);
      setUnits((prev) =>
        prev.map((u) => (u.unitId === unitId ? updated : u)),
      );
    },
    [token, propertyId],
  );

  const updateUnitStatus = useCallback(
    async (unitId: string, status: UnitStatus) => {
      const updated = await apiUpdateUnitStatus(
        token,
        propertyId,
        unitId,
        status,
      );
      setUnits((prev) =>
        prev.map((u) => (u.unitId === unitId ? updated : u)),
      );
    },
    [token, propertyId],
  );

  const deleteUnit = useCallback(
    async (unitId: string) => {
      await apiDeleteUnit(token, propertyId, unitId);
      setUnits((prev) => prev.filter((u) => u.unitId !== unitId));
    },
    [token, propertyId],
  );

  return {
    units,
    loading,
    error,
    refetch,
    createUnit,
    updateUnit,
    updateUnitStatus,
    deleteUnit,
  };
}
