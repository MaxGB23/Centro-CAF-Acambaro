import prisma from "@/lib/prisma";

const packageSessionsMap: Record<string, number> = {
  "S1": 1,
  "S5": 5,
  "S10": 10,
  "S15": 15,
  "S20": 20,
};

export async function getClientDetail(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      packages: {
        where: { status: { in: ["Activo", "Terminado"] } },
        include: {
          sessions: true,
          payments: true,
        },
        orderBy: {
          startDate: "desc",
        },
        take: 1, // solo el paquete activo
      },
    },
  });

  if (!client) return null;

  const activePackage = client.packages[0] ?? null;

  const totalPaid =
    activePackage?.payments.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const totalSessions = activePackage ? (packageSessionsMap[activePackage.packageType] || 0) : 0;

  const completedSessions =
    activePackage?.sessions.filter(s => s.status === "Completada").length ?? 0;

  const currentDebt =
    activePackage ? activePackage.totalPrice - totalPaid : 0;

  return {
    id: client.id,
    name: client.name,
    age: client.age,
    email: client.email,
    phone: client.phone,
    patologia: client.pathology,
    notes: client.notes,
    status: client.status,

    totalDebt: currentDebt,

    activePackage: activePackage
      ? {
          id: activePackage.id,
          type: activePackage.packageType,
          sessionsRemaining: totalSessions - completedSessions,
          sessionsTotal: totalSessions,
          currentDebt,
        }
      : null,
  };
}

export async function getClientPackages(clientId: string) {
  const packages = await prisma.clientPackage.findMany({
    where: { clientId },
    include: {
      sessions: true,
      payments: true,
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return packages.map(pkg => {
    const paid = pkg.payments.reduce((sum, p) => sum + p.amount, 0);
    const completed = pkg.sessions.filter(
      s => s.status === "Completada"
    ).length;
    
    const totalSessions = packageSessionsMap[pkg.packageType] || 0;

    return {
      id: pkg.id,
      type: pkg.packageType,
      cost: pkg.totalPrice,
      paid,
      debt: pkg.totalPrice - paid,
      sessionsCompleted: completed,
      sessionsTotal: totalSessions,
      startDate: pkg.startDate,
      status: pkg.status,
    };
  });
}

export async function getClientPayments(clientId: string) {
  const payments = await prisma.payment.findMany({
    where: {
      clientPackage: {
        clientId,
      },
    },
    include: {
      clientPackage: {
        select: {
          id: true,
          packageType: true,
        },
      },
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return payments.map(p => ({
    id: p.id,
    date: p.paymentDate,
    amount: p.amount,
    method: p.type,
    packageId: p.clientPackage.id,
    packageType: p.clientPackage.packageType,
    notes: p.notes,
  }));
}

export async function getClientSessions(clientId: string) {
  const sessions = await prisma.sessionRecord.findMany({
    where: {
      clientPackage: {
        clientId,
      },
    },
    include: {
      clientPackage: {
        select: {
          id: true,
          packageType: true,
        },
      },
    },
    orderBy: {
      sessionNumber: "desc",
    },
  });

  return sessions.map(s => ({
    id: s.id,
    sessionNumber: s.sessionNumber,
    date: s.sessionDate,
    packageId: s.clientPackage.id,
    packageType: s.clientPackage.packageType,
    status: s.status,
  }));
}

export async function getNextSession(clientId: string) {
  return prisma.sessionRecord.findFirst({
    where: {
      clientPackage: {
        clientId,
        status: "Activo",
      },
      status: "Pendiente",
      sessionDate: {
        not: null,
      },
    },
    orderBy: {
      sessionDate: "asc",
    },
  });
}

