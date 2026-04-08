"use client";

import { useCallback, useRef, useState } from "react";
import type {
  Category,
  CreateUnitPayload,
  Unit,
} from "@/types/habitaciones";
import { checkUnitCodeExists } from "@/services/apiHabitaciones";
import styles from "./UnidadModal.module.css";

type CodeCheckStatus = "idle" | "checking" | "available" | "taken";

interface Props {
  unit?: Unit | null;
  categories: Category[];
  preselectedCategoryId?: string;
  token: string;
  propertyId: string;
  onClose: () => void;
  onSubmit: (payload: CreateUnitPayload) => Promise<void>;
}

export default function UnidadModal({
  unit,
  categories,
  preselectedCategoryId,
  token,
  propertyId,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = !!unit;
  const activeCategories = categories.filter((c) => c.isActive);
  const codeCheckRef = useRef<string>("");

  const [payload, setPayload] = useState<CreateUnitPayload>(() => {
    if (unit) {
      return {
        categoryId: unit.categoryId,
        name: unit.name,
        code: unit.code,
        floor: unit.floor ?? "",
        description: unit.description ?? "",
        size: unit.size,
        capacity: { ...unit.capacity },
        photos: [...(unit.photos ?? [])],
      };
    }
    const cat = activeCategories.find(
      (c) => c.categoryId === preselectedCategoryId,
    ) ?? activeCategories[0];
    return {
      categoryId: cat?.categoryId ?? "",
      name: "",
      code: "",
      floor: "",
      description: "",
      size: cat?.size,
      capacity: cat ? { ...cat.capacity } : { adults: 2, children: 0 },
      photos: [],
    };
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeCheckStatus, setCodeCheckStatus] = useState<CodeCheckStatus>("idle");

  const selectedCategory = activeCategories.find(
    (c) => c.categoryId === payload.categoryId,
  );

  const handleCategoryChange = useCallback((categoryId: string) => {
    const cat = activeCategories.find((c) => c.categoryId === categoryId);
    setPayload((p) => ({
      ...p,
      categoryId,
      capacity: cat ? { ...cat.capacity } : p.capacity,
      size: cat?.size ?? p.size,
    }));
  }, [activeCategories]);

  const handleCodeBlur = useCallback(async () => {
    if (isEdit || !payload.code.trim() || !token || !propertyId) return;
    const code = payload.code.trim().toUpperCase();
    if (codeCheckRef.current === code) return;
    codeCheckRef.current = code;
    setCodeCheckStatus("checking");
    try {
      const exists = await checkUnitCodeExists(token, propertyId, code);
      setCodeCheckStatus(exists ? "taken" : "available");
    } catch {
      setCodeCheckStatus("idle");
    }
  }, [isEdit, payload.code, token, propertyId]);

  const handleCodeChange = useCallback((value: string) => {
    setPayload((p) => ({ ...p, code: value }));
    codeCheckRef.current = "";
    setCodeCheckStatus("idle");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!payload.categoryId) {
      setError("Selecciona una categoría");
      return;
    }
    if (!payload.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (!payload.code.trim()) {
      setError("El código es requerido");
      return;
    }
    if (payload.capacity.adults < 1) {
      setError("La capacidad de adultos debe ser al menos 1");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...payload,
        floor: payload.floor || undefined,
        description: payload.description || undefined,
        size: payload.size,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }, [payload, onSubmit, onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? "Editar unidad" : "Nueva unidad"}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Categoría *</label>
            <select
              className={styles.input}
              value={payload.categoryId}
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

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Nombre *</label>
            <input
              className={styles.input}
              value={payload.name}
              onChange={(e) =>
                setPayload((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Ej: Habitación 101"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Código *</label>
            <div className={styles.codeFieldWrap}>
              <input
                className={`${styles.input} ${codeCheckStatus === "taken" ? styles.inputError : ""}`}
                value={payload.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onBlur={handleCodeBlur}
                placeholder="Ej: 101"
                disabled={isEdit}
              />
              {!isEdit && codeCheckStatus === "available" && (
                <span className={styles.codeOk} title="Código disponible">
                  ✓
                </span>
              )}
              {!isEdit && codeCheckStatus === "taken" && (
                <span className={styles.codeError} title="Ya existe">
                  ✗
                </span>
              )}
              {!isEdit && codeCheckStatus === "checking" && (
                <span className={styles.codeChecking}>...</span>
              )}
            </div>
            {codeCheckStatus === "taken" && (
              <span className={styles.codeErrorMsg}>
                Ya existe una unidad con este código
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Piso</label>
            <input
              className={styles.input}
              value={payload.floor ?? ""}
              onChange={(e) =>
                setPayload((p) => ({ ...p, floor: e.target.value }))
              }
              placeholder="Ej: 1"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Descripción</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={payload.description ?? ""}
              onChange={(e) =>
                setPayload((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Override opcional sobre la categoría"
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

          {error && <span className={styles.errorMsg}>{error}</span>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || (!isEdit && codeCheckStatus === "taken")}
          >
            {submitting ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
