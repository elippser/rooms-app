"use client";

import { useCallback, useState } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import { useCategories } from "@/hooks/useCategories";
import { useUnitsList } from "@/hooks/useUnitsList";
import CategoriaList from "./categorias/CategoriaList";
import UnidadList from "./unidades/UnidadList";
import styles from "./GestionView.module.css";

type Tab = "categorias" | "unidades";

export default function GestionView() {
  const ctx = useAppContext();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories(ctx.token, ctx.propertyId);
  const {
    units,
    loading: unitsLoading,
    error: unitsError,
    refetch: refetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
  } = useUnitsList(ctx.token, ctx.propertyId);

  const [tab, setTab] = useState<Tab>("categorias");
  const [pendingAddUnitCategoryId, setPendingAddUnitCategoryId] = useState<
    string | null
  >(null);
  const clearPendingAddUnit = useCallback(
    () => setPendingAddUnitCategoryId(null),
    [],
  );

  if (!ctx.isReady) {
    return (
      <div className={styles.container}>
        <p style={{ padding: 24, color: "var(--text-muted)" }}>
          Contexto inválido — faltan parámetros en la URL (companyId,
          propertyId, token).
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${tab === "categorias" ? styles.active : ""}`}
          onClick={() => setTab("categorias")}
        >
          Categorías
        </button>
        <button
          className={`${styles.tab} ${tab === "unidades" ? styles.active : ""}`}
          onClick={() => setTab("unidades")}
        >
          Unidades
        </button>
      </div>
      <div className={styles.content}>
        {tab === "categorias" && (
          <CategoriaList
            categories={categories}
            loading={categoriesLoading}
            error={categoriesError}
            onCreate={createCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            onAddUnit={(categoryId) => {
              setPendingAddUnitCategoryId(categoryId);
              setTab("unidades");
            }}
          />
        )}
        {tab === "unidades" && (
          <UnidadList
            units={units}
            categories={categories}
            loading={unitsLoading}
            error={unitsError}
            token={ctx.token}
            propertyId={ctx.propertyId}
            onCreate={createUnit}
            onUpdate={updateUnit}
            onDelete={deleteUnit}
            onBulkSuccess={() => refetchUnits()}
            pendingAddUnitCategoryId={pendingAddUnitCategoryId}
            onClearPendingAddUnit={clearPendingAddUnit}
          />
        )}
      </div>
    </div>
  );
}
