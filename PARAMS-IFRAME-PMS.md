# Parámetros URL para integración en iframe (PMS)

La app de gestión de habitaciones lee **tema** y **color de acento** desde la URL. El PMS debe incluir estos parámetros al generar la URL del iframe para que la app se vea con el mismo tema y acento que la plataforma.

---

## Parámetros soportados

| Parámetro | Descripción | Valores | Por defecto |
|-----------|-------------|---------|-------------|
| `theme` | Tema claro / oscuro / sistema | `light`, `dark`, `system` | `system` |
| `accent` | Color de acento (hex) | 6 caracteres hex con o sin `#` | `#2f74df` |

El resto de parámetros que ya usa la app (`companyId`, `propertyId`, `token`, `spaceId`, etc.) se siguen pasando igual.

---

## Cómo usarlos en el PMS

Al construir la URL del iframe, añadir los query params correspondientes.

### Ejemplos de URL del iframe

**Tema oscuro + acento por defecto:**
```
https://tu-dominio-habitaciones.com?theme=dark&companyId=xxx&propertyId=yyy&token=zzz
```

**Tema claro + acento personalizado (ej. verde):**
```
https://tu-dominio-habitaciones.com?theme=light&accent=16a34a&companyId=xxx&propertyId=yyy&token=zzz
```

**Tema según preferencia del sistema + acento del workspace:**
```
https://tu-dominio-habitaciones.com?theme=system&accent=2f74df&companyId=xxx&propertyId=yyy&token=zzz
```

**Acento con almohadilla (también válido):**
```
...?accent=%232f74df
```
(o `accent=#2f74df` si el cliente URL-encodea)

---

## Valores de `theme`

- **`light`**: tema claro fijo.
- **`dark`**: tema oscuro fijo.
- **`system`**: sigue la preferencia del sistema operativo (`prefers-color-scheme`). Si el usuario tiene el SO en modo oscuro, se muestra tema oscuro; si no, claro.

Recomendación: usar el mismo valor que en la plataforma PMS (p. ej. si el PMS tiene selector “Claro / Oscuro / Sistema”, enviar ese valor en `theme`).

---

## Valor de `accent`

- Color en **hex de 6 caracteres**, con o sin `#`.
- Ejemplos válidos: `2f74df`, `#2f74df`, `16a34a`, `dc2626`.
- Debe ser el mismo que use el PMS para botones primarios, enlaces, bordes de foco y elementos destacados (`theme.accentColor` en la guía de diseño).

La app deriva automáticamente:
- `--accent-soft` (fondos suaves)
- `--accent-strong` (hover, estados activos)
- `--accent-text` / `--accent-contrast` (texto sobre el acento)

No hace falta enviar nada más; con un solo hex la app aplica el acento en botones, pestañas activas, inputs en foco, etc.

---

## Resumen para el equipo PMS

1. **Obtener** del workspace/dashboard del PMS:
   - modo de tema: `light` | `dark` | `system`
   - color de acento en hex (ej. `#2f74df` → enviar `2f74df` o `%232f74df`)

2. **Construir** la URL del iframe añadiendo:
   - `theme=<light|dark|system>`
   - `accent=<hex sin # o con #>`
   - y el resto de params actuales (`companyId`, `propertyId`, `token`, etc.).

3. **Ejemplo** en código (pseudocódigo):
   ```js
   const iframeSrc = `${HABITACIONES_APP_URL}?theme=${pmsTheme}&accent=${pmsAccentHex.replace('#','')}&companyId=${companyId}&propertyId=${propertyId}&token=${token}`;
   ```

Con esto, la app de habitaciones se integra visualmente con el mismo tema y acento que el PMS.
