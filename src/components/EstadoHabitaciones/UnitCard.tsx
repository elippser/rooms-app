"use client";

import type { Unit } from "@/types/habitaciones";
import StatusBadge from "./StatusBadge";
import styles from "./UnitCard.module.css";

const STATUS_COLORS: Record<string, string> = {
  available: "var(--status-available)",
  occupied: "var(--status-occupied)",
  cleaning: "var(--status-cleaning)",
  maintenance: "var(--status-maintenance)",
  blocked: "var(--status-blocked)",
  "checkout-pending": "var(--status-checkout-pending)",
};

interface Props {
  unit: Unit;
  onClick: (unit: Unit) => void;
  selected: boolean;
}

export default function UnitCard({ unit, onClick, selected }: Props) {
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={() => onClick(unit)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(unit)}
    >
      <div
        className={styles.statusStripe}
        style={{ background: STATUS_COLORS[unit.status] }}
      />

      <div className={styles.header}>
        <span className={styles.name}>{unit.code ?? unit.name}</span>
        <span className={styles.type}>
          {unit.category?.name ?? "Sin categoría"}
        </span>
      </div>

      <div className={styles.meta}>
        <span className={styles.capacity}>
          👤 {unit.capacity.adults}
          {unit.capacity.children > 0 && ` · 👶 ${unit.capacity.children}`}
        </span>
        <StatusBadge status={unit.status} />
      </div>
    </div>
  );
}
