import prisma from "@/lib/prisma";

export async function getDashboardClients() {
  const clients = await prisma.client.findMany({
    // where: { status: "Activo" },
    include: {
      packages: {
        where: { status: { in: ["Activo", "Adeudo", "Pagado", "Terminado"] } },
        include: {
          sessions: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 🔹 Transformación AQUÍ
  return clients.map((client) => {
    const activePackage = client.packages[0];

    const sessionsUsed = activePackage
      ? activePackage.sessions.filter((s) => s.status === "Completada").length
      : 0;

    const totalSessions = activePackage?.sessions.length ?? 0;

    const paid = activePackage
      ? activePackage.payments.reduce((s, p) => s + p.amount, 0)
      : 0;

    const adeudo = activePackage ? activePackage.totalPrice - paid : 0;

    const nextSession = activePackage?.sessions.find(
      (s) => s.status === "Pendiente"
    );

    return {
      id: client.id,
      nombre: client.name,
      edad: client.age,
      patologia: client.pathology,
      paqueteActivo: activePackage?.packageType ?? null,
      sesiones: `${sessionsUsed} / ${totalSessions}`,
      estatus: activePackage?.status ?? client.status,
      adeudo,
      siguienteSesion: nextSession?.sessionDate ?? null,
    };
  });
}
