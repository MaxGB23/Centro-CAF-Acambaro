# 🛠️ **PLAN GENERAL DE DESARROLLO (Next.js 16 + PostgreSQL)**

**Duración:** 4–8 semanas, dependiendo del nivel de detalle que quieras.

---

# **1. Arquitectura del proyecto**

### **Tecnologías principales**

* **Frontend:** Next.js 16 (app router)
* **Backend:** API routes del propio Next.js (o server actions)
* **Base de datos:** PostgreSQL
* **ORM:** Prisma
* **Autenticación:** NextAuth v5 (o Auth.js)
* **UI:** Tailwind + shadcn/ui
* **Cal.com Sync:** Webhooks + API REST

### **Diseño modular**

```
/app
  /dashboard
  /api
  /auth
  /clients
  /packages
  /payments
  /attendance
  /appointments
/prisma
  schema.prisma
```

---

# **2. Diseño de base de datos (ya definido)**

Tablas:

* clients
* pathologies
* client_pathologies
* packages
* client_packages
* payments
* attendance
* appointments (internas)

**Más:** tabla *webhook_events* para registrar eventos entrantes de Cal.com y evitar duplicados.

---

# **3. Integración con Cal.com**

### **3.1. Embedding en Next.js**

* Componente `<CalEmbed />`
* Token público si necesario
* Configuración de estilos responsive

### **3.2. Webhook listener (backend)**

Endpoint:

```
POST /api/cal/webhook
```

Recibe:

* BOOKING_CREATED
* BOOKING_RESCHEDULED
* BOOKING_CANCELLED

Guarda:

* cliente (si no existe → lo crea)
* cita interna (`appointments`)
* relación con paquetes activos (si aplica)

### **3.3. Sincronización manual (opcional)**

Cron job (Next Cron o Vercel Cron) para asegurar consistencia de datos.

---

# **4. Funcionalidades del Dashboard (MVP → Full)**

---

## **4.1. Módulo de Clientes**

### MVP:

* Lista de clientes
* CRUD (crear/editar/eliminar)
* Ficha del cliente con:

  * info personal
  * patologías
  * paquetes
  * citas futuras (Cal.com)
  * historial de asistencias

### Funciones “full”:

* Buscador avanzado
* Filtros (por patología, deuda, paquete)
* Notas clínicas privadas
* Adjuntos (archivos, imágenes, PDFs)

---

## **4.2. Módulo de Paquetes**

### MVP:

* CRUD de paquetes
* Asignar paquete a cliente
* Ver sesiones disponibles/usadas

### Full:

* Alertas de “sesiones por agotarse”
* Historial de paquetes por cliente
* Paquetes flexibles (por tiempo en vez de sesiones)

---

## **4.3. Módulo de Pagos**

### MVP:

* Registrar pago
* Asociarlo a un paquete
* Adelantos permitidos
* Calcular deuda

### Full:

* Integración con Stripe o MercadoPago
* Recibos en PDF
* Reportes mensuales

---

## **4.4. Módulo de Asistencias**

### MVP:

* Marcar asistencia diaria
* Ver sesiones usadas
* Registrar ausencias

### Full:

* Integración con el calendario (Cal.com) para marcar asistencia automáticamente
* Dashboard semanal de ocupación
* Exportación CSV

---

## **4.5. Módulo de Citas (Appointments)**

### MVP:

* Ver citas sincronizadas desde Cal.com
* CRUD interno para manejar asistencias
* Relación cita → paquete → asistencia

### Full:

* Calendario completo dentro del dashboard
* Reprogramación desde tu app (usando API de Cal.com)
* Notificaciones automáticas

---

## **4.6. Dashboard principal**

### MVP:

* KPIs:

  * clientes activos
  * citas de hoy
  * pagos del mes
  * sesiones restantes por cliente

### Full:

* Gráficas
* Tendencias
* Próximos vencimientos
* Alertas automáticas

---

# **5. Seguridad, Roles y Permisos**

### MVP:

* Autenticación con Google o email/password
* Rol: *admin* (fisioterapeuta)

### Full:

* Roles:

  * Admin
  * Recepcionista
  * Terapeuta asistente
* Permisos por módulo

---

# **6. Infraestructura**

### MVP:

* Deploy en:

  * Vercel (frontend + API)
  * Neon / Supabase (PostgreSQL)
* Webhooks conectados a rutas de API en Vercel

### Full:

* Logging
* Monitoring
* Backups automáticos
* CDN para archivos

---

# **7. Testing & QA**

### MVP:

* Pruebas manuales de:

  * reservas
  * sincronización
  * pagos
  * dashboard

### Full:

* Tests E2E con Playwright
* Tests de API con Vitest
* CI/CD con GitHub Actions

---

# **8. Entregables**

### MVP:

1. Dashboard funcional con:

   * clientes
   * paquetes
   * pagos
   * asistencias
   * citas sincronizadas
2. Base de datos PostgreSQL
3. Webhooks de Cal.com funcionando
4. Deploy en producción

### Full version:

* Sistema completo con roles, exportaciones, reportes, notificaciones y automatizaciones.

---

# **9. Flujo del proyecto con el cliente (importante)**

Antes de finalizar, necesitamos confirmar con tu cliente:

### 📌 ¿Qué es imprescindible para su versión 1?

* ¿Necesita **agenda dentro del dashboard**, o Cal.com cubre todo?
* ¿Desea registrar **pagos manualmente** o integrar Stripe?
* ¿Quiere enviar **recordatorios automáticos**?
* ¿Quiere que las **asistencias** se marquen automáticamente vía Cal.com?
* ¿Necesita **historia clínica**?
* ¿Cuántos usuarios usarán el sistema? (para permisos)

---

# 👉 Ahora sí: ¿qué le interesa a tu cliente?

Cuéntame qué puntos son importantes para ella y armo la planeación final, con prioridades y definición de sprints.
