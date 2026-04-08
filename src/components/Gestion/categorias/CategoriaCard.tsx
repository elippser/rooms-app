"use client";

import Image from "next/image";
import type { Category } from "@/types/habitaciones";
import styles from "./CategoriaCard.module.css";

interface Props {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onAddUnit?: () => void;
}

export default function CategoriaCard({ category, onEdit, onDelete, onAddUnit }: Props) {
  const amenities = category.amenities ?? [];
  const visibleAmenities = amenities.slice(0, 4);
  const extraCount = amenities.length - 4;
  const priceStr = `${category.basePrice.currency} ${category.basePrice.amount}/noche`;

  return (
    <div className={styles.card}>
      {category.photos?.[0] ? (
        <div className={styles.photoWrap}>
          <Image
            src={category.photos[0]}
            alt={category.name}
            fill
            className={styles.photo}
            sizes="(max-width: 400px) 100vw, 280px"
            unoptimized
          />
        </div>
      ) : (
        <div className={styles.photoWrap} />
      )}

      <div className={styles.content}>
        <h3 className={styles.name}>{category.name}</h3>
        {category.description && (
          <p className={styles.description}>{category.description}</p>
        )}
        <div className={styles.meta}>
          {category.capacity.adults} adultos
          {category.capacity.children > 0 &&
            ` · ${category.capacity.children} niños`}
          {category.size != null && ` · ${category.size}m²`}
        </div>
        <div className={styles.price}>{priceStr}</div>
        {amenities.length > 0 && (
          <div className={styles.amenities}>
            {visibleAmenities.map((a) => (
              <span key={a} className={styles.amenityChip}>
                {a}
              </span>
            ))}
            {extraCount > 0 && (
              <span className={styles.amenityChip}>+{extraCount}</span>
            )}
          </div>
        )}
        <div className={styles.unitCount}>
          {category.unitCount} {category.unitCount === 1 ? "unidad" : "unidades"}
          {onAddUnit && (
            <button
              type="button"
              className={styles.addUnitLink}
              onClick={(e) => {
                e.stopPropagation();
                onAddUnit();
              }}
            >
              Agregar unidad
            </button>
          )}
        </div>

        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.editBtn}`} onClick={onEdit}>
            Editar
          </button>
          <button
            className={`${styles.btn} ${styles.deleteBtn}`}
            onClick={onDelete}
            disabled={category.unitCount > 0}
            title={
              category.unitCount > 0
                ? "No se puede eliminar una categoría con unidades"
                : "Eliminar"
            }
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
