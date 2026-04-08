"use client";

import { useMemo, useState } from "react";
import type { Unit } from "@/types/habitaciones";
import { useAppContext } from "@/hooks/useAppContext";
import { useUnits } from "@/hooks/useUnits";
import UnitDetailPanel from "@/components/EstadoHabitaciones/UnitDetailPanel";
import styles from "./PlanoOcupacion.module.css";

const STATUS_COLORS: Record<string, string> = {
  available: "var(--status-available)",
  occupied: "var(--status-occupied)",
  cleaning: "var(--status-cleaning)",
  maintenance: "var(--status-maintenance)",
  blocked: "var(--status-blocked)",
  "checkout-pending": "var(--status-checkout-pending)",
};

interface FloorData {
  floor: string;
  units: Unit[];
  occupied: number;
  total: number;
}

function buildFloors(units: Unit[]): FloorData[] {
  const map: Record<string, Unit[]> = {};
  for (const u of units) {
    const key = u.floor ?? "Sin piso";
    (map[key] ??= []).push(u);
  }
  return Object.keys(map)
    .sort()
    .map((floor) => {
      const floorUnits = map[floor];
      return {
        floor,
        units: floorUnits,
        occupied: floorUnits.filter((u) => u.status === "occupied").length,
        total: floorUnits.length,
      };
    });
}

export default function PlanoOcupacion() {
  const ctx = useAppContext();
  const { units, loading, error, updateStatus } = useUnits(
    ctx.token,
    ctx.propertyId,
  );
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const floors = useMemo(() => buildFloors(units), [units]);

  if (!ctx.isReady) {
    return (
      <div className={styles.invalidCtx}>
        Contexto inválido — faltan parámetros en la URL (companyId, propertyId, token).
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Plano de Ocupación</h1>

      {loading && <div className={styles.loading}>Cargando...</div>}
      {error && <div className={styles.errorBox}>{error}</div>}
      {!loading && !error && units.length === 0 && (
        <div className={styles.empty}>No hay habitaciones registradas.</div>
      )}

      {floors.map((f) => {
        const pct = f.total > 0 ? (f.occupied / f.total) * 100 : 0;
        return (
          <div key={f.floor} className={styles.floorSection}>
            <div className={styles.floorHeader}>
              <span className={styles.floorLabel}>Piso {f.floor}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={styles.occupancyLabel}>
                {f.occupied} / {f.total} ocupadas
              </span>
            </div>

            <div className={styles.miniGrid}>
              {f.units.map((u) => (
                <div
                  key={u.unitId}
                  className={`${styles.miniUnit} ${selectedUnit?.unitId === u.unitId ? styles.miniUnitSelected : ""}`}
                  style={{ background: STATUS_COLORS[u.status] }}
                  title={`${u.code ?? u.name} — ${u.status}`}
                  onClick={() => setSelectedUnit(u)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedUnit(u)}
                />
              ))}
            </div>
          </div>
        );
      })}

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
