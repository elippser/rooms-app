"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Category,
  CreateUnitPayload,
  Unit,
} from "@/types/habitaciones";
import UnidadRow from "./UnidadRow";
import UnidadModal from "./UnidadModal";
import BulkCreateModal from "./BulkCreateModal";
import styles from "./UnidadList.module.css";

interface Props {
  units: Unit[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  token: string;
  propertyId: string;
  onCreate: (payload: CreateUnitPayload) => Promise<void>;
  onUpdate: (unitId: string, payload: Partial<CreateUnitPayload>) => Promise<void>;
  onDelete: (unitId: string) => Promise<void>;
  onBulkSuccess: (units: Unit[]) => void;
  pendingAddUnitCategoryId?: string | null;
  onClearPendingAddUnit?: () => void;
}

function groupByCategory(units: Unit[]): Record<string, Unit[]> {
  const map: Record<string, Unit[]> = {};
  for (const u of units) {
    const key = u.categoryId;
    (map[key] ??= []).push(u);
  }
  return map;
}

export default function UnidadList({
  units,
  categories,
  loading,
  error,
  token,
  propertyId,
  onCreate,
  onUpdate,
  onDelete,
  onBulkSuccess,
  pendingAddUnitCategoryId,
  onClearPendingAddUnit,
}: Props) {
  const [modalUnit, setModalUnit] = useState<Unit | null | "new">(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<
    string | undefined
  >(undefined);

  const groups = useMemo(() => groupByCategory(units), [units]);
  const categoryOrder = useMemo(() => {
    const ids = [...new Set(units.map((u) => u.categoryId))];
    const withUnits = ids.filter((id) => (groups[id]?.length ?? 0) > 0);
    const withoutUnits = categories
      .filter((c) => !withUnits.includes(c.categoryId))
      .map((c) => c.categoryId);
    return [...withUnits, ...withoutUnits];
  }, [units, categories, groups]);

  const handleDelete = async (unitId: string) => {
    if (!confirm("¿Eliminar esta unidad?")) return;
    try {
      await onDelete(unitId);
    } catch {
      // Error handled by parent
    }
  };

  const openNewForCategory = (categoryId: string) => {
    setPreselectedCategoryId(categoryId);
    setModalUnit("new");
  };

  const openBulkForCategory = (categoryId: string) => {
    setPreselectedCategoryId(categoryId);
    setBulkModalOpen(true);
  };

  useEffect(() => {
    if (pendingAddUnitCategoryId) {
      setPreselectedCategoryId(pendingAddUnitCategoryId);
      setModalUnit("new");
      onClearPendingAddUnit?.();
    }
  }, [pendingAddUnitCategoryId, onClearPendingAddUnit]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Unidades</h2>
        <div className={styles.headerActions}>
          <button
            className={styles.addBtn}
            onClick={() => {
              setPreselectedCategoryId(undefined);
              setModalUnit("new");
            }}
          >
            + Agregar una
          </button>
          <button
            className={styles.bulkBtn}
            onClick={() => {
              setPreselectedCategoryId(undefined);
              setBulkModalOpen(true);
            }}
          >
            + Agregar en lote
          </button>
        </div>
      </div>

      {loading && <div className={styles.loading}>Cargando unidades...</div>}
      {error && <div className={styles.errorBox}>{error}</div>}
      {!loading && !error && units.length === 0 && categories.length === 0 && (
        <div className={styles.empty}>
          Crea primero una categoría para agregar unidades.
        </div>
      )}
      {!loading && !error && units.length === 0 && categories.length > 0 && (
        <div className={styles.empty}>
          No hay unidades. Agrega una desde el botón &quot;+ Nueva&quot; o desde
          una categoría.
        </div>
      )}
      {!loading && !error && units.length > 0 && (
        <>
          {categoryOrder.map((categoryId) => {
            const cat = categories.find((c) => c.categoryId === categoryId);
            const categoryUnits = groups[categoryId] ?? [];
            const name = cat?.name ?? "Sin categoría";

            return (
              <div key={categoryId} className={styles.categoryGroup}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>
                    {name} ({categoryUnits.length})
                  </span>
                  <div className={styles.categoryActions}>
                    <button
                      className={styles.categoryAddBtn}
                      onClick={() => openNewForCategory(categoryId)}
                    >
                      + Agregar unidad
                    </button>
                    <button
                      className={styles.categoryBulkBtn}
                      onClick={() => openBulkForCategory(categoryId)}
                    >
                      + En lote
                    </button>
                  </div>
                </div>
                <div className={styles.tableHeader}>
                  <span>Cód</span>
                  <span>Nombre</span>
                  <span>Piso</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </div>
                {categoryUnits.map((u) => (
                  <UnidadRow
                    key={u.unitId}
                    unit={u}
                    onEdit={() => setModalUnit(u)}
                    onDelete={() => handleDelete(u.unitId)}
                  />
                ))}
              </div>
            );
          })}
        </>
      )}

      {modalUnit && (
        <UnidadModal
          unit={modalUnit === "new" ? null : modalUnit}
          categories={categories}
          preselectedCategoryId={preselectedCategoryId}
          token={token}
          propertyId={propertyId}
          onClose={() => {
            setModalUnit(null);
            setPreselectedCategoryId(undefined);
          }}
          onSubmit={async (payload) => {
            if (modalUnit === "new") {
              await onCreate(payload);
            } else {
              await onUpdate(modalUnit.unitId, payload);
            }
          }}
        />
      )}

      {bulkModalOpen && (
        <BulkCreateModal
          categories={categories}
          defaultCategoryId={preselectedCategoryId}
          token={token}
          propertyId={propertyId}
          onSuccess={(newUnits) => {
            onBulkSuccess(newUnits);
            setBulkModalOpen(false);
            setPreselectedCategoryId(undefined);
          }}
          onClose={() => {
            setBulkModalOpen(false);
            setPreselectedCategoryId(undefined);
          }}
        />
      )}
    </div>
  );
}
