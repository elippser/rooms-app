import type { UnitStatus } from "@/types/habitaciones";
import { STATUS_LABELS } from "@/types/habitaciones";
import styles from "./StatusBadge.module.css";

const STATUS_CLASS: Record<UnitStatus, string> = {
  available: styles.available,
  occupied: styles.occupied,
  cleaning: styles.cleaning,
  maintenance: styles.maintenance,
  blocked: styles.blocked,
  "checkout-pending": styles["checkout-pending"],
};

interface Props {
  status: UnitStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status] ?? ""}`}>
      <span className={styles.dot} />
      {STATUS_LABELS[status]}
    </span>
  );
}
