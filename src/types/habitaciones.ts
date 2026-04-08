export type UnitStatus =
  | "available"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "blocked"
  | "checkout-pending";

export interface BasePrice {
  amount: number;
  currency: string;
}

export interface Category {
  categoryId: string;
  propertyId: string;
  companyId: string;
  name: string;
  description?: string;
  size?: number;
  capacity: { adults: number; children: number };
  basePrice: BasePrice;
  photos: string[];
  amenities: string[];
  customProperties?: Record<string, unknown>;
  isActive: boolean;
  unitCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  unitId: string;
  propertyId: string;
  companyId: string;
  categoryId: string;
  category?: Category;
  name: string;
  code: string;
  floor?: string;
  description?: string;
  size?: number;
  capacity: { adults: number; children: number };
  photos: string[];
  status: UnitStatus;
  customProperties?: Record<string, unknown>;
  isActive: boolean;
  lastChange?: {
    previousStatus: UnitStatus;
    changedByUserId: string;
    changedAt: string;
    notes?: string;
  };
}

export interface UnitStateHistory {
  historyId: string;
  unitId: string;
  propertyId: string;
  companyId: string;
  previousStatus: UnitStatus;
  newStatus: UnitStatus;
  changedByUserId: string;
  changedAt: string;
  notes?: string;
}

export interface AppContext {
  companyId: string;
  propertyId: string;
  spaceId?: string;
  token: string;
  role?: "owner" | "admin" | "staff";
}

export const VALID_TRANSITIONS: Record<UnitStatus, UnitStatus[]> = {
  available: ["occupied", "cleaning", "maintenance", "blocked"],
  occupied: ["checkout-pending"],
  "checkout-pending": ["available", "cleaning", "maintenance", "blocked"],
  cleaning: ["available", "maintenance", "blocked"],
  maintenance: ["available", "cleaning", "blocked"],
  blocked: ["available", "occupied", "cleaning", "maintenance"],
};

export const STATUS_COLORS: Record<UnitStatus, string> = {
  available: "#22c55e",
  occupied: "#ef4444",
  cleaning: "#eab308",
  maintenance: "#f97316",
  blocked: "#6b7280",
  "checkout-pending": "#a855f7",
};

export const STATUS_LABELS: Record<UnitStatus, string> = {
  available: "Disponible",
  occupied: "Ocupada",
  cleaning: "Limpieza",
  maintenance: "Mantenimiento",
  blocked: "Bloqueada",
  "checkout-pending": "Checkout pendiente",
};

export const AMENITY_OPTIONS = [
  "WiFi",
  "AC",
  "TV",
  "Minibar",
  "Caja fuerte",
  "Jacuzzi",
  "Balcón",
  "Vista al mar",
  "Cocina",
  "Desayuno incluido",
  "Estacionamiento",
  "Pet friendly",
];

export const CURRENCY_OPTIONS = ["USD", "ARS", "EUR", "BRL"] as const;

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  size?: number;
  capacity: { adults: number; children: number };
  basePrice: { amount: number; currency: string };
  photos: string[];
  amenities: string[];
  customProperties?: Record<string, unknown>;
}

export interface CreateUnitPayload {
  categoryId: string;
  name: string;
  code: string;
  floor?: string;
  description?: string;
  size?: number;
  capacity: { adults: number; children: number };
  photos: string[];
  customProperties?: Record<string, unknown>;
}

export interface BulkCreatePayload {
  quantity: number;
  floor?: string;
  codePrefix: string;
  codeStart: number;
  capacity: { adults: number; children: number };
  size?: number;
  customProperties?: Record<string, unknown>;
}

export interface BulkPreviewUnit {
  code: string;
  name: string;
  floor?: string;
  conflict: boolean;
}

export interface BulkPreviewResponse {
  units: BulkPreviewUnit[];
  hasConflicts: boolean;
  conflictCount: number;
}
