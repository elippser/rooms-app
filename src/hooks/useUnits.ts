"use client";

import { useCallback, useEffect, useState } from "react";
import type { Unit, UnitStatus } from "@/types/habitaciones";
import { getUnitsState, updateUnitStatus as apiUpdateStatus } from "@/services/apiHabitaciones";

export function useUnits(token: string, propertyId: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!token || !propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUnitsState(token, propertyId);
      setUnits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [token, propertyId]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const updateStatus = useCallback(
    async (unitId: string, status: UnitStatus, notes?: string) => {
      await apiUpdateStatus(token, propertyId, unitId, status, notes);
      setUnits((prev) =>
        prev.map((u) => (u.unitId === unitId ? { ...u, status } : u)),
      );
    },
    [token, propertyId],
  );

  return { units, loading, error, refetch: fetch_, updateStatus };
}
