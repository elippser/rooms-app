"use client";

import { useCallback, useState } from "react";
import type {
  BulkCreatePayload,
  BulkPreviewResponse,
  Category,
  Unit,
} from "@/types/habitaciones";
import {
  previewBulkUnits,
  bulkCreateUnits,
} from "@/services/apiHabitaciones";
import styles from "./BulkCreateModal.module.css";

interface Props {
  categories: Category[];
  defaultCategoryId?: string;
  token: string;
  propertyId: string;
  onSuccess: (units: Unit[]) => void;
  onClose: () => void;
}

export default function BulkCreateModal({
  categories,
  defaultCategoryId,
  token,
  propertyId,
  onSuccess,
  onClose,
}: Props) {
  const activeCategories = categories.filter((c) => c.isActive);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    () => defaultCategoryId || activeCategories[0]?.categoryId || "",
  );
  const [payload, setPayload] = useState<BulkCreatePayload>(() => {
    const cat = activeCategories.find((c) => c.categoryId === defaultCategoryId)
      ?? activeCategories[0];
    return {
      quantity: 10,
      floor: "1",
      codePrefix: "HAB",
      codeStart: 101,
      capacity: cat ? { ...cat.capacity } : { adults: 2, children: 0 },
      size: cat?.size ?? 28,
    };
  });

  const [preview, setPreview] = useState<BulkPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = activeCategories.find(
    (c) => c.categoryId === selectedCategoryId,
  );

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const cat = activeCategories.find((c) => c.categoryId === categoryId);
    setPayload((p) => ({
      ...p,
      capacity: cat ? { ...cat.capacity } : p.capacity,
      size: cat?.size ?? p.size,
    }));
  }, [activeCategories]);

  const handlePreview = useCallback(async () => {
    if (!selectedCategoryId) {
      setError("Selecciona una categoría");
      return;
    }
    if (payload.quantity < 1 || payload.quantity > 100) {
      setError("Cantidad debe estar entre 1 y 100");
      return;
    }
    if (!payload.codePrefix.trim()) {
      setError("El prefijo de código es requerido");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await previewBulkUnits(
        token,
        propertyId,
        selectedCategoryId,
        payload,
      );
      setPreview(result);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener preview");
    } finally {
      setLoading(false);
    }
  }, [token, propertyId, selectedCategoryId, payload]);

  const handleCreate = useCallback(async () => {
    if (!selectedCategoryId || !preview || preview.hasConflicts) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await bulkCreateUnits(
        token,
        propertyId,
        selectedCategoryId,
        payload,
      );
      onSuccess(result.units);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear unidades");
    } finally {
      setSubmitting(false);
    }
  }, [token, propertyId, selectedCategoryId, payload, preview, onSuccess, onClose]);

  const handleBack = useCallback(() => {
    setStep(1);
    setPreview(null);
    setError(null);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crear unidades en lote</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {step === 1 && (
            <>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Categoría *</label>
                <select
                  className={styles.input}
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Seleccionar categoría</option>
                  {activeCategories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Prefijo de código *</label>
                  <input
                    className={styles.input}
                    value={payload.codePrefix}
                    onChange={(e) =>
                      setPayload((p) => ({ ...p, codePrefix: e.target.value }))
                    }
                    placeholder="HAB"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Número inicial *</label>
                  <input
                    type="number"
                    min={1}
                    className={styles.input}
                    value={payload.codeStart}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        codeStart: Math.max(1, parseInt(e.target.value, 10) || 1),
                      }))
                    }
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Cantidad *</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className={styles.input}
                  value={payload.quantity}
                  onChange={(e) =>
                    setPayload((p) => ({
                      ...p,
                      quantity: Math.max(
                        1,
                        Math.min(100, parseInt(e.target.value, 10) || 1),
                      ),
                    }))
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Piso</label>
                <input
                  className={styles.input}
                  value={payload.floor ?? ""}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, floor: e.target.value }))
                  }
                  placeholder="1"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Capacidad adultos</label>
                  <input
                    type="number"
                    min={1}
                    className={styles.input}
                    value={payload.capacity.adults}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        capacity: {
                          ...p.capacity,
                          adults: Math.max(1, parseInt(e.target.value, 10) || 1),
                        },
                      }))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Capacidad niños</label>
                  <input
                    type="number"
                    min={0}
                    className={styles.input}
                    value={payload.capacity.children}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        capacity: {
                          ...p.capacity,
                          children: Math.max(0, parseInt(e.target.value, 10) || 0),
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tamaño (m²)</label>
                <input
                  type="number"
                  min={0}
                  className={styles.input}
                  value={payload.size ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPayload((p) => ({
                      ...p,
                      size: v ? parseInt(v, 10) : undefined,
                    }));
                  }}
                  placeholder="Opcional"
                />
              </div>
            </>
          )}

          {step === 2 && preview && (
            <>
              <p className={styles.previewIntro}>
                Se crearán {preview.units.length} unidades en{" "}
                &quot;{selectedCategory?.name ?? "categoría"}&quot;
              </p>

              <div className={styles.previewTable}>
                <div className={styles.previewTableHeader}>
                  <span>Código</span>
                  <span>Piso</span>
                  <span>Estado</span>
                </div>
                {preview.units.map((u) => (
                  <div
                    key={u.code}
                    className={`${styles.previewRow} ${u.conflict ? styles.conflict : ""}`}
                  >
                    <span>{u.code}</span>
                    <span>{u.floor ?? "-"}</span>
                    <span
                      className={
                        u.conflict ? styles.statusConflict : styles.statusOk
                      }
                    >
                      {u.conflict ? "✗ Ya existe" : "✓ Disponible"}
                    </span>
                  </div>
                ))}
              </div>

              {preview.hasConflicts && (
                <div className={styles.conflictWarning}>
                  ⚠ {preview.conflictCount} código
                  {preview.conflictCount !== 1 ? "s" : ""} en conflicto.
                  Resolvé antes de crear.
                </div>
              )}
            </>
          )}

          {error && <span className={styles.errorMsg}>{error}</span>}
        </div>

        <div className={styles.footer}>
          {step === 1 ? (
            <>
              <div className={styles.footerLeft} />
              <div className={styles.footerRight}>
                <button className={styles.cancelBtn} onClick={onClose}>
                  Cancelar
                </button>
                <button
                  className={styles.previewBtn}
                  onClick={handlePreview}
                  disabled={loading || !selectedCategoryId}
                >
                  {loading ? "Cargando..." : "Ver preview →"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.footerLeft}>
                <button className={styles.backBtn} onClick={handleBack}>
                  ← Volver
                </button>
              </div>
              <div className={styles.footerRight}>
                <button
                  className={styles.submitBtn}
                  onClick={handleCreate}
                  disabled={submitting || !preview || preview.hasConflicts}
                >
                  {submitting
                    ? "Creando..."
                    : `Crear ${preview?.units.length ?? 0} unidades`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
