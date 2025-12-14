
**Proyecto Fisioterapia — Registro de Avance**

- **Propósito**: Mantener un historial claro de cambios y decisiones durante el desarrollo del dashboard de gestión de pacientes y del Centro CAF Acámbaro (Fisioterapía y rehabilitación).

**Tecnologías**
- **Framework**: Next.js 16 (app router)
- **Lenguaje**: TypeScript
- **UI**: shadcn/ui (Tailwind CSS)
- **Tabla/Estado**: TanStack React Table, dnd-kit, zustand(futuro)
- **Validación**: Zod
- **ORM**: Prisma (PostgreSQL) — enums para estados y tipos
- **Notificaciones**: Sonner

**Estructura y archivos clave**
- **src/app/(dashboard)/dashboard/data.json**: Datos de ejemplo (clientes, paquetes, sesiones, adeudos, próximas citas).
- **src/components/data-table.tsx**: Tabla principal para listar y editar clientes; contiene seleccionables, reordenamiento por drag-and-drop y edición inline.
- **prisma/schema.prisma**: Modelo de datos; enums importantes: `ClientStatus`, `PackageStatus`, `PackageType`, `SessionStatus`, `PaymentType`.

**Features implementadas**
- **Listado de pacientes**: Nombre, edad, patología, paquete activo, sesiones usadas/total, estatus derivado, adeudo, próxima cita.
- **Edición inline**: `nombre`, `edad`, `patologia`, `adeudo` con submit por Enter y notificación.
- **Selects controlados**: Paquete (S5,S10,S15,S20) y estatus derivado (Activo, Adeudo, Terminado, Inactivo) sincronizados con `data.json`.
- **Navegación a cliente**: Click en el nombre redirige a `/dashboard/cliente/[id]` usando `next/link`.
- **Reordenamiento**: Drag handle para cambiar orden de filas usando `dnd-kit`.

## Autenticación (Better Auth)

**Estado**: Implementada (login y registro funcionales)

---

### Stack de autenticación
- **Librería**: Better Auth  
- **Estrategia**: Email + Password  
- **Framework**: Next.js (App Router)  
- **ORM**: Prisma (adapter oficial)  
- **Cookies**: `nextCookies` plugin  
- **Validación de formularios**: React Hook Form + Zod  

---

### Arquitectura
- **Client Components** para:
  - Formularios de login y registro
  - Manejo de errores y estados (`loading`, `error`)
  - Navegación post-auth (`router.push`)
- **Auth Client (`createAuthClient`)**:
  - Uso directo de `authClient.signIn.email` y `authClient.signUp.email`
- **Middleware (planeado)**:
  - Protección de rutas privadas (`/dashboard`)
  - Manejo de `callbackUrl` para redirecciones post-login

---

### Configuración principal (`auth.ts`)
- Se utiliza `betterAuth` con `prismaAdapter` (PostgreSQL).
- Autenticación por **email y contraseña** habilitada.
- Se definen **campos adicionales en el usuario**:
  - `role`
  - `position`

#### Campos adicionales
- Se almacenan en la base de datos.
- **No son editables desde el cliente** (`input: false`).
- Solo pueden ser modificados desde lógica administrativa (backend).

---

### Tipado e inferencia
- Tipos inferidos automáticamente desde `betterAuth`:
  - `Session`
  - `User`
- Se utiliza `inferAdditionalFields` en el cliente para:
  - Incluir `role` y `position` en la sesión tipada
  - Mantener coherencia entre base de datos, servidor y cliente

📌 Esto permite mantener **tipado fuerte end-to-end**  
(**DB → Auth → Client**)


**Reglas de datos y coherencia**
- Los valores de campos con opciones (paquete, estatus, etc.) deben coincidir con los enums en `schema.prisma`.
- `sesiones` es un campo derivado con formato `usadas / totales` donde `totales` depende del `paqueteActivo`.
- `estatus` es derivado y puede ser `Activo`, `Inactivo`, `Adeudo` o `Terminado` según reglas combinadas de `clients.status`, paquete y pagos.

## Rutas y navegación

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page — información general del Centro CAF Acámbaro |
| `/login` | Formulario de login (email + contraseña) — redirige a `/dashboard` si ya está autenticado |
| `/api/auth/[...all]` | Endpoints de Better Auth (signup, signin, signout, session) |
| `/dashboard` | **Página principal** — listado de pacientes en tabla interactiva con edición inline, filtros y drag-and-drop |
| `/dashboard/cliente/[id]` | **Detalle del cliente** — información específica del paciente, historial de sesiones, pagos, próximas citas |
| `/dashboard/registro` | Página de registro de nuevos usuarios(usuarios no pacientes, mediante better auth)
| `/dashboard/ejemplo` | Página de demostración / pruebas (uso interno de desarrollo) |

**Notas de navegación**
- Desde la tabla del dashboard, al hacer click en el nombre del paciente se navega a `/dashboard/cliente/[id]`.
- Post-login, el usuario es redirigido automáticamente al dashboard.
- Protección de rutas `/dashboard/*` planeada (middleware en progreso).

**Cómo probar en desarrollo**
1. Instalar dependencias: `pnpm install`
2. Ejecutar en modo desarrollo: `pnpm dev`
3. Abrir `http://localhost:3000/dashboard` y revisar la tabla en el dashboard.

**Guía rápida de commits**
- Prefijo de rama: `feature/`, `fix/`, `chore/`.
- Mensaje de commit: `tipo(scope): descripción breve` — por ejemplo `feat(data): alinear sesiones con paquete activo`.
- Incluir en el cuerpo del commit cambios relevantes en `prisma/schema.prisma` o `src/app/(dashboard)/dashboard/data.json` cuando afecten enums o formato de datos.

**Próximos pasos**
- Integrar persistencia real con Prisma Client y endpoints API para CRUD (clientes, paquetes, sesiones, pagos, citas).
- Añadir validaciones y migraciones automáticas para mantener enums sincronizados entre frontend y Prisma.
- Implementar filtros y búsqueda por enums (paquete, estatus, sesión, tipo de pago).

---

Fecha snapshot: 2025-12-14 — registrar cambios significativos antes de cada commit mayor.
