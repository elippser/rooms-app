# Elippser PMS - Frontend

Frontend para gestión de habitaciones, construido con **Next.js 15** y TypeScript.

## Requisitos

- Node.js 18+
- Backend API de habitaciones corriendo en `http://localhost:4000` (puerto 4000 — **no** 3001)

## Configuración API

Copia `.env.example` a `.env.local` y ajusta si hace falta:

```bash
cp .env.example .env.local
```

Variable: `NEXT_PUBLIC_HABITACIONES_API_URL` (default: `http://localhost:4000`).  
**Importante:** Esta app solo usa la API de habitaciones (4000). El puerto 3001 es del PMS y no debe usarse aquí.

## Instalación

```bash
npm install
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo en http://localhost:3000 |
| `npm run build` | Build de producción |
| `npm start` | Ejecutar build de producción |
| `npm run lint` | Ejecutar ESLint |

## Estructura

```
src/
├── app/           # App Router (layout, página principal)
├── components/    # Componentes React
├── lib/           # Utilidades (api client)
└── types/         # Tipos TypeScript
```

## API

Las peticiones van directamente a la API de habitaciones (`NEXT_PUBLIC_HABITACIONES_API_URL`). Asegúrate de tener el backend (`api/`) corriendo en el puerto 4000 antes de usar el frontend.
