import prisma from "@/lib/prisma";

export async function getDashboardClients() {
  const clients = await prisma.client.findMany({
    // where: { status: "Activo" },
    include: {
      packages: {
        include: {
          sessions: true,
          payments: true,
        },
        orderBy: { startDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 🔹 Transformación AQUÍ
  return clients.map((client) => {
    // Buscar primero el paquete activo
    const activePackage = client.packages.find(pkg => pkg.status === "Activo") 
      ?? client.packages[0] // Si no hay activo, tomar el más reciente
      ?? null;

    const sessionsUsed = activePackage
      ? activePackage.sessions.filter((s) => s.status === "Completada").length
      : 0;
// 🔹 Calcular el total de sesiones del paquete
// if packageType is S1, S5, S10, S15, S20, then totalSessions is the packageType
    const totalSessions = activePackage?.packageType === "S1" ? 1 : activePackage?.packageType === "S5" ? 5 : activePackage?.packageType === "S10" ? 10 : activePackage?.packageType === "S15" ? 15 : activePackage?.packageType === "S20" ? 20 : 0;
    // const totalSessions = activePackage?.sessions.length ?? 0;
    
    const paid = activePackage
      ? activePackage.payments.reduce((s, p) => s + p.amount, 0)
      : 0;

    const adeudo = activePackage ? activePackage.totalPrice - paid : 0;

    const nextSession = activePackage?.sessions.find(
      (s) => s.status === "Pendiente"
    );

    // 🔹 Calcular el estatus UI basado en la lógica de negocio
    let estatusPaqueteUI: "Activo" | "Terminado" | null = null;
    
    if (activePackage) {
      if (activePackage.status === "Terminado") {
        estatusPaqueteUI = "Terminado";
      } else {
        // Todo lo demás se considera "Activo"
        estatusPaqueteUI = "Activo";
      }
    }

    return {
      id: client.id,
      nombre: client.name,
      edad: client.age,
      patologia: client.pathology,
      paqueteActivo: activePackage?.packageType ?? null,
      sesiones: `${sessionsUsed} / ${totalSessions}`,
      estatusCliente: client.status,
      estatusPaquete: estatusPaqueteUI,
      adeudo,
      siguienteSesion: nextSession?.sessionDate ?? null,
    };
  });
}

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const [activeClients, totalClients, monthlyEarnings, todaySessions] = await Promise.all([
    prisma.client.count({ where: { status: "Activo" } }),
    prisma.client.count(),
    prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.sessionRecord.count({
      where: {
        sessionDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
  ]);

  return {
    activeClients,
    totalClients,
    monthlyEarnings: monthlyEarnings._sum.amount ?? 0,
    todaySessions,
  };
}
