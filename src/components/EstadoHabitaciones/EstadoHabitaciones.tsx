"use client";

import { useMemo, useState } from "react";
import type { Unit } from "@/types/habitaciones";
import { useAppContext } from "@/hooks/useAppContext";
import { useUnits } from "@/hooks/useUnits";
import { useCategories } from "@/hooks/useCategories";
import FilterBar from "./FilterBar";
import UnitCard from "./UnitCard";
import UnitDetailPanel from "./UnitDetailPanel";
import styles from "./EstadoHabitaciones.module.css";

function groupByFloor(units: Unit[]): Record<string, Unit[]> {
  const map: Record<string, Unit[]> = {};
  for (const u of units) {
    const key = u.floor ?? "Sin piso";
    (map[key] ??= []).push(u);
  }
  return map;
}

function groupByCategory(units: Unit[]): Record<string, Unit[]> {
  const map: Record<string, Unit[]> = {};
  for (const u of units) {
    const key = u.categoryId ?? "sin-categoria";
    (map[key] ??= []).push(u);
  }
  return map;
}

export default function EstadoHabitaciones() {
  const ctx = useAppContext();
  const { units, loading, error, refetch, updateStatus } = useUnits(
    ctx.token,
    ctx.propertyId,
  );
  const { categories } = useCategories(ctx.token, ctx.propertyId);

  const [statusFilter, setStatusFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [groupBy, setGroupBy] = useState<"floor" | "category">("floor");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const floors = useMemo(
    () =>
      [...new Set(units.map((u) => u.floor).filter(Boolean))].sort() as string[],
    [units],
  );

  const filtered = useMemo(() => {
    let result = units;
    if (statusFilter) result = result.filter((u) => u.status === statusFilter);
    if (floorFilter) result = result.filter((u) => u.floor === floorFilter);
    if (categoryFilter)
      result = result.filter((u) => u.categoryId === categoryFilter);
    return result;
  }, [units, statusFilter, floorFilter, categoryFilter]);

  const groups = useMemo(
    () =>
      groupBy === "floor" ? groupByFloor(filtered) : groupByCategory(filtered),
    [filtered, groupBy],
  );

  const categoryNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) map[c.categoryId] = c.name;
    for (const u of units) {
      if (u.category?.name && !map[u.categoryId])
        map[u.categoryId] = u.category.name;
    }
    return map;
  }, [categories, units]);

  const sortedKeys = useMemo(() => {
    const keys = Object.keys(groups);
    if (groupBy === "floor") return keys.sort();
    return keys.sort((a, b) => {
      const na = categoryNames[a] ?? a;
      const nb = categoryNames[b] ?? b;
      return na.localeCompare(nb);
    });
  }, [groups, groupBy, categoryNames]);

  if (!ctx.isReady) {
    return (
      <div className={styles.invalidCtx}>
        Contexto inválido — faltan parámetros en la URL (companyId,
        propertyId, token).
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Estado de Habitaciones</h1>
        <div className={styles.actions}>
          <select
            className={styles.groupSelect}
            value={groupBy}
            onChange={(e) =>
              setGroupBy(e.target.value as "floor" | "category")
            }
            title="Agrupar por"
          >
            <option value="floor">Por piso</option>
            <option value="category">Por categoría</option>
          </select>
          <button
            className={styles.refreshBtn}
            onClick={refetch}
            title="Refrescar"
          >
            ↻
          </button>
        </div>
      </div>

      <FilterBar
        statusFilter={statusFilter}
        floorFilter={floorFilter}
        categoryFilter={categoryFilter}
        floors={floors}
        categories={categories}
        onStatusChange={setStatusFilter}
        onFloorChange={setFloorFilter}
        onCategoryChange={setCategoryFilter}
      />

      {loading && <div className={styles.loading}>Cargando habitaciones...</div>}

      {error && <div className={styles.errorBox}>{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.empty}>No se encontraron habitaciones.</div>
      )}

      {sortedKeys.map((key) => (
        <div key={key} className={styles.floorGroup}>
          <span className={styles.floorLabel}>
            {groupBy === "floor"
              ? `Piso ${key}`
              : categoryNames[key] ?? "Sin categoría"}
          </span>
          <div className={styles.grid}>
            {groups[key].map((unit) => (
              <UnitCard
                key={unit.unitId}
                unit={unit}
                selected={selectedUnit?.unitId === unit.unitId}
                onClick={setSelectedUnit}
              />
            ))}
          </div>
        </div>
      ))}

      {selectedUnit && (
        <UnitDetailPanel
          unit={selectedUnit}
          token={ctx.token}
          onClose={() => setSelectedUnit(null)}
          onStatusChange={async (unitId, status, notes) => {
            await updateStatus(unitId, status, notes);
            setSelectedUnit((prev) =>
              prev && prev.unitId === unitId ? { ...prev, status } : prev,
            );
          }}
        />
      )}
    </div>
  );
}
