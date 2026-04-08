"use client";

import type { Unit } from "@/types/habitaciones";
import StatusBadge from "@/components/EstadoHabitaciones/StatusBadge";
import styles from "./UnidadRow.module.css";

interface Props {
  unit: Unit;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UnidadRow({ unit, onEdit, onDelete }: Props) {
  return (
    <div className={styles.row}>
      <span className={styles.code}>{unit.code}</span>
      <span className={styles.name}>{unit.name}</span>
      <span className={styles.floor}>{unit.floor ?? "-"}</span>
      <StatusBadge status={unit.status} />
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.editBtn}`}
          onClick={onEdit}
          title="Editar"
        >
          E
        </button>
        <button
          className={`${styles.btn} ${styles.deleteBtn}`}
          onClick={onDelete}
          title="Eliminar"
        >
          X
        </button>
      </div>
    </div>
  );
}
