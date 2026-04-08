"use client";

import { useState } from "react";
import type { Category, CreateCategoryPayload } from "@/types/habitaciones";
import CategoriaCard from "./CategoriaCard";
import CategoriaModal from "./CategoriaModal";
import styles from "./CategoriaList.module.css";

interface Props {
  categories: Category[];
  loading: boolean;
  error: string | null;
  onCreate: (payload: CreateCategoryPayload) => Promise<void>;
  onUpdate: (categoryId: string, payload: Partial<CreateCategoryPayload>) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
  onAddUnit?: (categoryId: string) => void;
}

export default function CategoriaList({
  categories,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onAddUnit,
}: Props) {
  const [modalCategory, setModalCategory] = useState<Category | null | "new">(
    null,
  );

  const handleDelete = async (categoryId: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await onDelete(categoryId);
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Categorías</h2>
        <button
          className={styles.addBtn}
          onClick={() => setModalCategory("new")}
        >
          + Nueva
        </button>
      </div>

      {loading && <div className={styles.loading}>Cargando categorías...</div>}
      {error && <div className={styles.errorBox}>{error}</div>}
      {!loading && !error && categories.length === 0 && (
        <div className={styles.empty}>
          No hay categorías. Crea una para comenzar.
        </div>
      )}
      {!loading && !error && categories.length > 0 && (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <CategoriaCard
              key={cat.categoryId}
              category={cat}
              onEdit={() => setModalCategory(cat)}
              onDelete={() => handleDelete(cat.categoryId)}
              onAddUnit={onAddUnit ? () => onAddUnit(cat.categoryId) : undefined}
            />
          ))}
        </div>
      )}

      {modalCategory && (
        <CategoriaModal
          category={modalCategory === "new" ? null : modalCategory}
          onClose={() => setModalCategory(null)}
          onSubmit={async (payload) => {
            if (modalCategory === "new") {
              await onCreate(payload);
            } else {
              await onUpdate(modalCategory.categoryId, payload);
            }
          }}
        />
      )}
    </div>
  );
}
