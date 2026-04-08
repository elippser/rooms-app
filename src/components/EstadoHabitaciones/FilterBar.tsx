"use client";

import type { Category, UnitStatus } from "@/types/habitaciones";
import { STATUS_LABELS } from "@/types/habitaciones";
import styles from "./FilterBar.module.css";

const ALL_STATUSES: UnitStatus[] = [
  "available",
  "occupied",
  "cleaning",
  "maintenance",
  "blocked",
  "checkout-pending",
];

const LEGEND: { status: UnitStatus; color: string }[] = [
  { status: "available", color: "var(--status-available)" },
  { status: "occupied", color: "var(--status-occupied)" },
  { status: "cleaning", color: "var(--status-cleaning)" },
  { status: "maintenance", color: "var(--status-maintenance)" },
  { status: "blocked", color: "var(--status-blocked)" },
  { status: "checkout-pending", color: "var(--status-checkout-pending)" },
];

interface Props {
  statusFilter: string;
  floorFilter: string;
  categoryFilter: string;
  floors: string[];
  categories: Category[];
  onStatusChange: (v: string) => void;
  onFloorChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
}

export default function FilterBar({
  statusFilter,
  floorFilter,
  categoryFilter,
  floors,
  categories,
  onStatusChange,
  onFloorChange,
  onCategoryChange,
}: Props) {
  return (
    <div className={styles.bar}>
      <select
        className={styles.select}
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">Todos los estados</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={floorFilter}
        onChange={(e) => onFloorChange(e.target.value)}
      >
        <option value="">Todos los pisos</option>
        {floors.map((f) => (
          <option key={f} value={f}>
            Piso {f}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.categoryId} value={c.categoryId}>
            {c.name}
          </option>
        ))}
      </select>

      <div className={styles.legend}>
        {LEGEND.map((l) => (
          <span key={l.status} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: l.color }} />
            {STATUS_LABELS[l.status]}
          </span>
        ))}
      </div>
    </div>
  );
}
