# 🛠️ Centro CAF Acámbaro — Sistema de Gestión

Sistema web para la **gestión administrativa, clínica y contable** del *Centro CAF Acámbaro* (Fisioterapia y Rehabilitación). El proyecto busca reemplazar la gestión actual basada en hojas de Excel por una plataforma moderna, tipada y escalable.

---

## 🎯 Objetivo del proyecto

Actualmente, el centro gestiona:

* pacientes
* sesiones
* pagos y adelantos
* citas

mediante **archivos de Excel**, lo que genera:

* trabajo manual repetitivo
* errores en el control de pagos
* desorden por exceso de hojas (una por cliente)
* poca visibilidad del estado real del negocio

Este sistema centraliza toda la información en un **dashboard administrativo**, automatiza reglas de negocio y prepara la base para escalar (reportes, calendario, métricas y más).

---

## 🧱 Tecnologías principales

### Frontend

* **Next.js 16** (App Router)
* **React 19** (sin React Compiler)
* **TypeScript**
* **Tailwind CSS v4**
* **shadcn/ui**
* **TanStack React Table** (tablas avanzadas y data grids)
* **nuqs** (manejo de estado en la URL)

### Backend

* **Next.js API Routes**
* **Server Actions**
* **Supabase** (BaaS)
* **Prisma ORM** (acceso a datos)

### Base de datos

* **PostgreSQL** (Supabase)

### Autenticación

* **Better Auth** (Email + Password)

### Integraciones

* **Cal.com**

  * API REST
  * Webhooks
  * Embed Widget

---

## 🧠 Problemática actual

El centro utiliza un archivo de Excel donde:

* cada cliente es una hoja distinta
* las sesiones se anotan manualmente
* los pagos y adelantos no siguen una estructura clara

### Ejemplo actual (Excel)

**PAQUETE DE 5 SESIONES**

| Sesión | Fecha            | Detalle             |
| ------ | ---------------- | ------------------- |
| 1      | 22/09/2025 12:00 | $1,250              |
| 2      | 24/09/2025 12:00 | Adelanto $1000      |
| 3      | 26/09/2025 11:00 | Adelanto $250       |
| 4      | Pendiente        | 1000 + 250 = PAGADO |
| 5      | Pendiente        | —                   |

Esto provoca confusión en:

* estado real del pago
* sesiones pendientes
* historial por cliente

---

## 🧩 Solución propuesta

### 📊 Dashboard principal

* Tabla CRUD de pacientes con:

  * nombre
  * edad
  * patología
  * paquete
  * estatus
  * pagos / adeudos
* Edición inline
* Reordenamiento
* Navegación directa a detalle por cliente

### 📈 Visualización de métricas

* Total de pacientes
* Pacientes activos
* Contabilidad por:

  * mes
  * quincena
  * periodo personalizado

### 👤 Vista detalle de cliente

Al seleccionar un cliente:

* Información personal
* Tabla CRUD de sesiones
* Historial de pagos y adelantos
* Estado derivado automático (activo, adeudo, terminado, inactivo)

### 📅 Citas (planeado)

* Vista de calendario (día / semana)
* Sincronización con **Cal.com** vía webhook
* Inserción automática de citas en la base de datos
* Relación cita ↔ cliente

---

## 🔐 Autenticación y seguridad

* Login y registro con **Better Auth**
* Sesiones tipadas end-to-end
* Protección de rutas privadas (`/dashboard`)
* Roles y campos administrativos preparados para backend

---

## 🗂️ Arquitectura y enfoque

* App Router (Server + Client Components)
* Tipado fuerte de punta a punta
* Reglas de negocio derivadas (no duplicar estado)
* Enums compartidos entre frontend y base de datos
* Preparado para escalar sin deuda técnica temprana

---

## 🚀 Cómo correr el proyecto

### 📦 Instalación
Instala las dependencias del proyecto ejecutando:

```bash
pnpm install
```

---

## 🛣️ Roadmap

* [ ] Persistencia completa con Prisma Client
* [ ] CRUD API para clientes, sesiones y pagos
* [ ] Dashboard financiero avanzado
* [ ] Calendario de citas sincronizado con Cal.com
* [ ] Reportes exportables
* [ ] Control de roles administrativos

---

## 📌 Estado del proyecto

🟡 En desarrollo activo

Este proyecto está siendo construido como una **solución real para un cliente real**, priorizando claridad, mantenibilidad y escalabilidad.

---

**Centro CAF Acámbaro — Fisioterapia y Rehabilitación**

---

## 📄 Licencia
Proyecto distribuido bajo la licencia MIT.
