"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppContext } from "@/hooks/useAppContext";
import styles from "./TabNav.module.css";

const BASE_TABS = [
  { href: "/estado", label: "Estado de Habitaciones" },
  { href: "/plano", label: "Plano de Ocupación" },
] as const;

const GESTION_TAB = { href: "/gestion", label: "Gestión" } as const;

export default function TabNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAppContext();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  const showGestion = role === "owner" || role === "admin";
  const tabs = showGestion
    ? [...BASE_TABS, GESTION_TAB]
    : [...BASE_TABS];

  return (
    <nav className={styles.nav}>
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={`${t.href}${suffix}`}
          className={`${styles.tab} ${pathname === t.href ? styles.active : ""}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
