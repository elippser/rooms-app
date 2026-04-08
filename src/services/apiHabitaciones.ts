import type {
  BulkCreatePayload,
  BulkPreviewResponse,
  Category,
  CreateCategoryPayload,
  CreateUnitPayload,
  Unit,
  UnitStatus,
  UnitStateHistory,
} from "@/types/habitaciones";

/**
 * API de habitaciones — SIEMPRE puerto 4000.
 * NO usar 3001 (es la API del PMS, proyecto distinto).
 */
const API_BASE =
  process.env.NEXT_PUBLIC_HABITACIONES_API_URL ?? "http://localhost:4040";

function headers(token: string) {
  const t = token.trim();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${t}`,
    "X-Access-Token": t,
  };
}

function unitsUrl(propertyId: string, ...segments: string[]) {
  return `${API_BASE}/api/v1/properties/${propertyId}/units${segments.length ? "/" + segments.join("/") : ""}`;
}

function categoriesUrl(propertyId: string, ...segments: string[]) {
  return `${API_BASE}/api/v1/properties/${propertyId}/categories${segments.length ? "/" + segments.join("/") : ""}`;
}

async function request<T>(input: string, init: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }
  return res.json();
}

// — Categories —

export async function getCategories(
  token: string,
  propertyId: string,
): Promise<Category[]> {
  return request<Category[]>(categoriesUrl(propertyId), {
    headers: headers(token),
  });
}

export async function getCategory(
  token: string,
  propertyId: string,
  categoryId: string,
): Promise<Category> {
  return request<Category>(categoriesUrl(propertyId, categoryId), {
    headers: headers(token),
  });
}

export async function createCategory(
  token: string,
  propertyId: string,
  payload: CreateCategoryPayload,
): Promise<Category> {
  return request<Category>(categoriesUrl(propertyId), {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  token: string,
  propertyId: string,
  categoryId: string,
  payload: Partial<CreateCategoryPayload>,
): Promise<Category> {
  return request<Category>(categoriesUrl(propertyId, categoryId), {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(
  token: string,
  propertyId: string,
  categoryId: string,
): Promise<void> {
  await request<{ message: string }>(categoriesUrl(propertyId, categoryId), {
    method: "DELETE",
    headers: headers(token),
  });
}

// — Units —

export async function getUnitsState(
  token: string,
  propertyId: string,
): Promise<Unit[]> {
  return request<Unit[]>(unitsUrl(propertyId, "states"), {
    headers: headers(token),
  });
}

export async function getUnits(
  token: string,
  propertyId: string,
  params?: { code?: string },
): Promise<Unit[]> {
  const url = new URL(unitsUrl(propertyId));
  if (params?.code?.trim()) {
    url.searchParams.set("code", params.code.trim());
  }
  return request<Unit[]>(url.toString(), {
    headers: headers(token),
  });
}

export async function checkUnitCodeExists(
  token: string,
  propertyId: string,
  code: string,
): Promise<boolean> {
  const units = await getUnits(token, propertyId, { code });
  return units.length > 0;
}

export async function previewBulkUnits(
  token: string,
  propertyId: string,
  categoryId: string,
  payload: BulkCreatePayload,
): Promise<BulkPreviewResponse> {
  const url = `${API_BASE}/api/v1/properties/${propertyId}/categories/${categoryId}/units/bulk/preview`;
  return request<BulkPreviewResponse>(url, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function bulkCreateUnits(
  token: string,
  propertyId: string,
  categoryId: string,
  payload: BulkCreatePayload,
): Promise<{ created: number; units: Unit[] }> {
  const url = `${API_BASE}/api/v1/properties/${propertyId}/categories/${categoryId}/units/bulk`;
  return request<{ created: number; units: Unit[] }>(url, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function getUnit(
  token: string,
  propertyId: string,
  unitId: string,
): Promise<Unit> {
  return request<Unit>(unitsUrl(propertyId, unitId), {
    headers: headers(token),
  });
}

export async function createUnit(
  token: string,
  propertyId: string,
  payload: CreateUnitPayload,
): Promise<Unit> {
  return request<Unit>(unitsUrl(propertyId), {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function updateUnit(
  token: string,
  propertyId: string,
  unitId: string,
  payload: Partial<CreateUnitPayload>,
): Promise<Unit> {
  return request<Unit>(unitsUrl(propertyId, unitId), {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
}

export async function updateUnitStatus(
  token: string,
  propertyId: string,
  unitId: string,
  status: UnitStatus,
  notes?: string,
): Promise<Unit> {
  return request<Unit>(unitsUrl(propertyId, unitId, "status"), {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify({ status, notes }),
  });
}

export async function getUnitHistory(
  token: string,
  propertyId: string,
  unitId: string,
): Promise<UnitStateHistory[]> {
  return request<UnitStateHistory[]>(unitsUrl(propertyId, unitId, "history"), {
    headers: headers(token),
  });
}

export async function deleteUnit(
  token: string,
  propertyId: string,
  unitId: string,
): Promise<void> {
  await request<{ message: string }>(unitsUrl(propertyId, unitId), {
    method: "DELETE",
    headers: headers(token),
  });
}
