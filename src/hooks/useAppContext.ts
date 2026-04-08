"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import type { AppContext } from "@/types/habitaciones";

interface JwtPayload {
  userId?: string;
  companyId?: string;
  role?: "owner" | "admin" | "staff";
  email?: string;
}

/** Query string puede corromper JWT base64 (+ → espacio). El padre debe usar encodeURIComponent(token). */
function normalizeTokenFromQuery(raw: string): string {
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).replace(/\s+/g, "+").trim();
  } catch {
    return raw.replace(/\s+/g, "+").trim();
  }
}

function getRoleFromToken(token: string): "owner" | "admin" | "staff" {
  if (!token) return "staff";
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const role = payload?.role;
    if (role === "owner" || role === "admin" || role === "staff") return role;
    return "staff";
  } catch {
    return "staff";
  }
}

export function useAppContext(): AppContext & { isReady: boolean } {
  const params = useSearchParams();

  return useMemo(() => {
    const companyId = params.get("companyId") ?? "";
    const propertyId = params.get("propertyId") ?? "";
    const token = normalizeTokenFromQuery(params.get("token") ?? "");
    const spaceId = params.get("spaceId") ?? undefined;
    const role = getRoleFromToken(token);

    return {
      companyId,
      propertyId,
      spaceId,
      token,
      role,
      isReady: !!(companyId && propertyId && token),
    };
  }, [params]);
}
