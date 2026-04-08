# pms-app-habitaciones — Frontend
> Next.js 15 · App Router · CSS Modules · TypeScript · Repo: pms-app-habitaciones/frontend

---

## Contexto de integración

La app se renderiza dentro del shell de Elippser. El área disponible para el contenido respeta:

- *Header superior del shell:* 50px fijo — la app no lo renderiza, lo respeta
- *Sidebar izquierdo:* variable — 60px comprimido / 260px expandido
- *Área de contenido:* el resto del viewport, 100% flexible

La app recibe el contexto via query params en la URL al montarse:


?companyId=...&propertyId=...&spaceId=...&token=...


El token es temporal para el demo. En producción se reemplaza por la cookie app_token compartida bajo .tuplataforma.com.

---

## Estructura de archivos


frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    — layout raíz, sin header/sidebar propio
│   │   ├── page.tsx                      — redirect a /estado
│   │   ├── estado/
│   │   │   └── page.tsx                  — Estado de Habitaciones
│   │   └── plano/
│   │       └── page.tsx                  — Plano de Ocupación
│   ├── components/
│   │   ├── EstadoHabitaciones/
│   │   │   ├── EstadoHabitaciones.tsx
│   │   │   ├── EstadoHabitaciones.module.css
│   │   │   ├── UnitCard.tsx
│   │   │   ├── UnitCard.module.css
│   │   │   ├── UnitDetailPanel.tsx       — panel lateral al clickear una unidad
│   │   │   ├── UnitDetailPanel.module.css
│   │   │   ├── StatusBadge.tsx
│   │   │   └── FilterBar.tsx
│   │   ├── PlanoOcupacion/
│   │   │   ├── PlanoOcupacion.tsx
│   │   │   └── PlanoOcupacion.module.css
│   │   └── shared/
│   │       ├── AppShell.tsx              — wrapper que respeta el layout del PMS
│   │       └── AppShell.module.css
│   ├── hooks/
│   │   ├── useAppContext.ts              — lee query params (companyId, propertyId, token)
│   │   └── useUnits.ts                  — fetch y estado de unidades
│   ├── services/
│   │   └── apiHabitaciones.ts           — todas las llamadas al backend propio
│   └── types/
│       └── habitaciones.ts              — tipos locales de la app
├── next.config.ts
└── package.json


---

## Tipos

Archivo: src/types/habitaciones.ts

typescript
export type UnitType =
  | "single" | "double" | "twin" | "triple"
  | "suite" | "presidential" | "cabin"
  | "apartment" | "dorm" | "custom";

export type UnitStatus =
  | "available"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "blocked"
  | "checkout-pending";

export interface Unit {
  unitId: string;
  propertyId: string;
  companyId: string;
  name: string;
  number?: string;
  floor?: string;
  description?: string;
  type: UnitType;
  capacity: { adults: number; children: number };
  size?: number;
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

export interface AppContext {
  companyId: string;
  propertyId: string;
  spaceId?: string;
  token: string;
}


---

## Hook — useAppContext

Archivo: src/hooks/useAppContext.ts

Lee los query params de la URL y los expone al resto de la app.

typescript
// Retorna:
{
  companyId: string;
  propertyId: string;
  spaceId?: string;
  token: string;
  isReady: boolean;   // true cuando todos los params necesarios están presentes
}


Si faltan companyId, propertyId o token → isReady: false → la app muestra un estado de error "Contexto inválido".

---

## Hook — useUnits

Archivo: src/hooks/useUnits.ts

typescript
// Estado que expone:
{
  units: Unit[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateStatus: (unitId: string, status: UnitStatus, notes?: string) => Promise<void>;
}


Llama a GET /properties/:propertyId/units/states al montar. El refetch manual reemplaza polling o websockets en esta fase.

---

## Servicio — apiHabitaciones.ts

typescript
// Listar unidades con estado actual
getUnitsState(token, propertyId): Promise<Unit[]>

// Detalle de una unidad
getUnit(token, propertyId, unitId): Promise<Unit>

// Crear unidad
createUnit(token, propertyId, payload): Promise<Unit>

// Editar unidad
updateUnit(token, propertyId, unitId, payload): Promise<Unit>

// Cambiar estado
updateUnitStatus(token, propertyId, unitId, status, notes?): Promise<Unit>

// Historial de una unidad
getUnitHistory(token, propertyId, unitId): Promise<UnitStateHistory[]>

// Soft delete
deleteUnit(token, propertyId, unitId): Promise<void>


---

## Componente — AppShell

Archivo: src/components/shared/AppShell.tsx

Wrapper raíz de la app. No renderiza header ni sidebar propios. Solo define el área de contenido respetando el espacio del shell del PMS.

css
/* AppShell.module.css */
.shell {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}


---

## Vista — Estado de Habitaciones (/estado)

### Layout general


┌─────────────────────────────────────────────────────┐
│ Estado de Habitaciones              [+ Nueva] [↻]   │  ← 48px
├──────────────────────────────┬──────────────────────┤
│ Filtros: [Todos ▾] [Piso ▾]  │  Leyenda de colores  │  ← 40px
├──────────────────────────────┴──────────────────────┤
│                                                     │
│  Piso 1                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  101   │ │  102   │ │  103   │ │  104   │       │
│  │ Doble  │ │ Single │ │ Suite  │ │ Doble  │       │
│  │ ●Libre │ │ ●Ocup. │ │ ●Limp. │ │ ●Mant. │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                     │
│  Piso 2                                             │
│  ...                                                │
│                                              [panel]│
└─────────────────────────────────────────────────────┘


### Colores de estado

| Status | Color |
|--------|-------|
| available | #22c55e verde |
| occupied | #ef4444 rojo |
| cleaning | #eab308 amarillo |
| maintenance | #f97316 naranja |
| blocked | #6b7280 gris |
| checkout-pending | #a855f7 violeta |

### Componente UnitCard


Props:
  unit: Unit
  onClick: (unit: Unit) => void
  selected: boolean

Muestra:
  - Número/nombre de la unidad
  - Tipo
  - Capacidad (iconos adultos/niños)
  - Indicador de color por status (borde o punto)
  - Si selected: borde destacado


### Componente FilterBar

Filtros disponibles:
- *Estado:* Todos / Libre / Ocupada / Limpieza / Mantenimiento / Bloqueada / Checkout pendiente
- *Piso:* Todos / Piso 1 / Piso 2 / ...
- *Tipo:* Todos / Single / Doble / Suite / ...

Los filtros son locales (no llaman al backend), filtran el array en memoria.

### Panel lateral — UnitDetailPanel

Se abre al clickear una UnitCard. Ocupa ~340px desde la derecha, sobre el contenido (no desplaza el grid).


Contenido del panel:
  - Nombre de la unidad (header)
  - Foto principal si existe
  - Descripción, tipo, capacidad, tamaño
  - Status actual con badge de color
  - Selector de nuevo status (dropdown con transiciones válidas)
  - Campo de notas para el cambio
  - Botón "Cambiar estado"
  - Separador
  - Historial de últimos 5 cambios (fecha, de → a, quién, notas)
  - Botón "Editar unidad" → abre modal de edición
  - Botón "Eliminar" (solo owner/admin, con confirmación)


---

## Vista — Plano de Ocupación (/plano)

Vista simplificada para esta fase. Lista agrupada por piso con barra de ocupación visual.


┌─────────────────────────────────────────────────────┐
│ Plano de Ocupación                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Piso 1  ████████████░░░░░░  6 / 10 ocupadas        │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐         │
│  │● ││● ││● ││● ││● ││● ││○ ││○ ││○ ││○ │         │
│  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘         │
│                                                     │
│  Piso 2  ████░░░░░░░░░░░░░░  2 / 8 ocupadas         │
│  ...                                                │
│                                                     │
└─────────────────────────────────────────────────────┘


Cada unidad es un cuadrado pequeño con color por estado. Click → abre el mismo UnitDetailPanel de la vista de estado.

---

## Navegación interna

Tab bar simple en la parte superior del contenido:


[Estado de Habitaciones]  [Plano de Ocupación]


Rutas: /estado y /plano. El tab activo se resalta con el color de acento.

---

## Orden de implementación


1. Setup Next.js 15 + CSS Modules + TypeScript
2. src/types/habitaciones.ts
3. useAppContext.ts
4. apiHabitaciones.ts
5. useUnits.ts
6. AppShell.tsx
7. StatusBadge.tsx
8. UnitCard.tsx
9. FilterBar.tsx
10. EstadoHabitaciones.tsx — grid + agrupación por piso
11. UnitDetailPanel.tsx — panel lateral + cambio de estado
12. PlanoOcupacion.tsx
13. Layout.tsx + páginas /estado y /plano
14. Tab bar de navegación interna


---

## Lo que queda fuera de scope en esta fase

- Modal de creación/edición de unidades (CRUD visual)
- Subida de fotos
- Tiempo real con WebSockets
- Drag & drop en el plano
- Reportes de limpieza