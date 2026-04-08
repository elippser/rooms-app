"use client";

import { useCallback, useState } from "react";
import type { Category, CreateCategoryPayload } from "@/types/habitaciones";
import { AMENITY_OPTIONS, CURRENCY_OPTIONS } from "@/types/habitaciones";
import styles from "./CategoriaModal.module.css";

interface Props {
  category?: Category | null;
  onClose: () => void;
  onSubmit: (payload: CreateCategoryPayload) => Promise<void>;
}

const defaultPayload: CreateCategoryPayload = {
  name: "",
  description: "",
  capacity: { adults: 2, children: 0 },
  basePrice: { amount: 0, currency: "USD" },
  photos: [],
  amenities: [],
};

export default function CategoriaModal({
  category,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = !!category;
  const [payload, setPayload] = useState<CreateCategoryPayload>(() =>
    category
      ? {
          name: category.name,
          description: category.description ?? "",
          size: category.size,
          capacity: { ...category.capacity },
          basePrice: { ...category.basePrice },
          photos: [...(category.photos ?? [])],
          amenities: [...(category.amenities ?? [])],
        }
      : { ...defaultPayload },
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customAmenity, setCustomAmenity] = useState("");

  const toggleAmenity = useCallback((a: string) => {
    setPayload((prev) => {
      const list = prev.amenities ?? [];
      const has = list.includes(a);
      return {
        ...prev,
        amenities: has ? list.filter((x) => x !== a) : [...list, a],
      };
    });
  }, []);

  const addCustomAmenity = useCallback(() => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    setPayload((prev) => ({
      ...prev,
      amenities: [...(prev.amenities ?? []), trimmed],
    }));
    setCustomAmenity("");
  }, [customAmenity]);

  const addPhoto = useCallback(() => {
    setPayload((prev) => ({
      ...prev,
      photos: [...(prev.photos ?? []), ""],
    }));
  }, []);

  const updatePhoto = useCallback((index: number, url: string) => {
    setPayload((prev) => {
      const photos = [...(prev.photos ?? [])];
      photos[index] = url;
      return { ...prev, photos };
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPayload((prev) => {
      const photos = [...(prev.photos ?? [])];
      photos.splice(index, 1);
      return { ...prev, photos };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!payload.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (payload.capacity.adults < 1) {
      setError("La capacidad de adultos debe ser al menos 1");
      return;
    }
    if (payload.basePrice.amount < 0) {
      setError("El precio debe ser mayor o igual a 0");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(payload);
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
            {isEdit ? "Editar categoría" : "Nueva categoría"}
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
            <label className={styles.fieldLabel}>Nombre *</label>
            <input
              className={styles.input}
              value={payload.name}
              onChange={(e) =>
                setPayload((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Ej: Habitación Doble Estándar"
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
              placeholder="Descripción opcional"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Capacidad adultos *</label>
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

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Precio base *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                className={styles.input}
                value={payload.basePrice.amount}
                onChange={(e) =>
                  setPayload((p) => ({
                    ...p,
                    basePrice: {
                      ...p.basePrice,
                      amount: Math.max(0, parseFloat(e.target.value) || 0),
                    },
                  }))
                }
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Moneda</label>
              <select
                className={styles.input}
                value={payload.basePrice.currency}
                onChange={(e) =>
                  setPayload((p) => ({
                    ...p,
                    basePrice: {
                      ...p.basePrice,
                      currency: e.target.value,
                    },
                  }))
                }
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Amenities</label>
            <div className={styles.amenitiesGrid}>
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`${styles.amenityChip} ${
                    payload.amenities?.includes(a) ? styles.selected : ""
                  }`}
                  onClick={() => toggleAmenity(a)}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className={styles.photoRow} style={{ marginTop: 8 }}>
              <input
                className={styles.input}
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                placeholder="Agregar amenity personalizado"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAmenity())}
              />
              <button
                type="button"
                className={styles.addPhotoBtn}
                onClick={addCustomAmenity}
              >
                + Agregar
              </button>
            </div>
            {payload.amenities?.filter((a) => !AMENITY_OPTIONS.includes(a)).length ? (
              <div className={styles.amenitiesGrid} style={{ marginTop: 8 }}>
                {payload.amenities
                  .filter((a) => !AMENITY_OPTIONS.includes(a))
                  .map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`${styles.amenityChip} ${styles.selected}`}
                      onClick={() => toggleAmenity(a)}
                    >
                      {a} &times;
                    </button>
                  ))}
              </div>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Fotos (URLs)</label>
            {(payload.photos ?? []).map((url, i) => (
              <div key={i} className={styles.photoRow} style={{ marginBottom: 8 }}>
                <input
                  className={styles.input}
                  value={url}
                  onChange={(e) => updatePhoto(i, e.target.value)}
                  placeholder={`URL foto ${i + 1}`}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removePhoto(i)}
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addPhotoBtn}
              onClick={addPhoto}
            >
              + Agregar foto
            </button>
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
            disabled={submitting}
          >
            {submitting ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
