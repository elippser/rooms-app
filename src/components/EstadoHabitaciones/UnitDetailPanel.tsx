"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Unit, UnitStatus, UnitStateHistory } from "@/types/habitaciones";
import { VALID_TRANSITIONS, STATUS_LABELS } from "@/types/habitaciones";
import { getUnitHistory } from "@/services/apiHabitaciones";
import StatusBadge from "./StatusBadge";
import styles from "./UnitDetailPanel.module.css";

interface Props {
  unit: Unit;
  token: string;
  onClose: () => void;
  onStatusChange: (unitId: string, status: UnitStatus, notes?: string) => Promise<void>;
}

export default function UnitDetailPanel({
  unit,
  token,
  onClose,
  onStatusChange,
}: Props) {
  const [newStatus, setNewStatus] = useState<UnitStatus | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<UnitStateHistory[]>([]);

  const validTargets = VALID_TRANSITIONS[unit.status] ?? [];

  useEffect(() => {
    setNewStatus("");
    setNotes("");
    setError(null);

    getUnitHistory(token, unit.propertyId, unit.unitId)
      .then((h) => setHistory(h.slice(0, 5)))
      .catch(() => setHistory([]));
  }, [unit.unitId, unit.propertyId, token]);

  const handleSubmit = useCallback(async () => {
    if (!newStatus) return;
    setSubmitting(true);
    setError(null);
    try {
      await onStatusChange(unit.unitId, newStatus, notes || undefined);
      setNewStatus("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado");
    } finally {
      setSubmitting(false);
    }
  }, [newStatus, notes, onStatusChange, unit.unitId]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.unitName}>
            {unit.code ?? unit.name}
          </span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {unit.photos?.length > 0 && (
            <div className={styles.photo} style={{ position: "relative" }}>
              <Image
                src={unit.photos[0]}
                alt={unit.name}
                fill
                style={{ objectFit: "cover", borderRadius: "var(--radius-md)" }}
                unoptimized
              />
            </div>
          )}

          {unit.description && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Descripción</span>
              <span className={styles.fieldValue}>{unit.description}</span>
            </div>
          )}

          <div className={styles.infoGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Categoría</span>
              <span className={styles.fieldValue}>
                {unit.category?.name ?? "Sin categoría"}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Capacidad</span>
              <span className={styles.fieldValue}>
                {unit.capacity.adults} adultos
                {unit.capacity.children > 0 && `, ${unit.capacity.children} niños`}
              </span>
            </div>
            {unit.size != null && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Tamaño</span>
                <span className={styles.fieldValue}>{unit.size} m²</span>
              </div>
            )}
            {unit.floor && (
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Piso</span>
                <span className={styles.fieldValue}>{unit.floor}</span>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Estado actual</span>
            <StatusBadge status={unit.status} />
          </div>

          <hr className={styles.separator} />

          <div className={styles.section}>
            <span className={styles.sectionTitle}>Cambiar estado</span>

            <select
              className={styles.statusSelect}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as UnitStatus)}
            >
              <option value="">Seleccionar nuevo estado...</option>
              {validTargets.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>

            <textarea
              className={styles.notesInput}
              placeholder="Notas del cambio (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {error && <span className={styles.errorMsg}>{error}</span>}

            <button
              className={styles.submitBtn}
              disabled={!newStatus || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Cambiando..." : "Cambiar estado"}
            </button>
          </div>

          {history.length > 0 && (
            <>
              <hr className={styles.separator} />
              <div className={styles.section}>
                <span className={styles.sectionTitle}>Historial reciente</span>
                <div className={styles.historyList}>
                  {history.map((h) => (
                    <div key={h.historyId} className={styles.historyItem}>
                      <span className={styles.historyTransition}>
                        {STATUS_LABELS[h.previousStatus]} → {STATUS_LABELS[h.newStatus]}
                      </span>
                      <span className={styles.historyMeta}>
                        {formatDate(h.changedAt)}
                      </span>
                      {h.notes && (
                        <span className={styles.historyNotes}>{h.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
