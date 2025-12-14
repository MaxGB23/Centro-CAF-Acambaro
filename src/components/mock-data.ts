export const dashboardClients = [
  {
    id: "1",
    nombre: "María López",
    edad: 34,
    patologia: "Lumbalgia crónica",
    paquete: "5 sesiones",
    estatus: "Activo",
    pago: "Parcial (1000 / 1250)",
  },
  {
    id: "2",
    nombre: "Juan Pérez",
    edad: 42,
    patologia: "Rehabilitación de rodilla",
    paquete: "10 sesiones",
    estatus: "Finalizado",
    pago: "Pagado (2000 / 2000)",
  },
];

export const clientInfo = {
  id: "1",
  nombre: "María López",
  edad: 34,
  email: "maria.lopez@example.com",
  telefono: "477-555-1020",
  patologia: "Lumbalgia crónica",
  notas: "Paciente responde bien al calor profundo.",
};

export const clientPackages = [
  {
    id: "101",
    nombrePaquete: "Paquete 5 sesiones",
    fechaAdquisicion: "2025-09-22",
    costoTotal: 1250,
    pagosRealizados: 1250,
    adeudo: 0,
    estatus: "Pagado",
    sesionesTotales: 5,
    sesionesRealizadas: 3,
    sesionesPendientes: 2,
    activo: true,
  },
];

export const sesionesPorPaquete = [
  { numero: 1, fecha: "2025-09-22 12:00", estatus: "Asistida" },
  { numero: 2, fecha: "2025-09-24 12:00", estatus: "Asistida" },
  { numero: 3, fecha: "2025-09-26 11:00", estatus: "Asistida" },
  { numero: 4, fecha: null, estatus: "Pendiente" },
  { numero: 5, fecha: null, estatus: "Pendiente" },
];
