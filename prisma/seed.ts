import prisma from "@/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  /**
   * ============================
   * CLIENTE 1 — CON PAQUETE ACTIVO Y ADEUDO
   * ============================
   */
  const maria = await prisma.client.create({
    data: {
      name: "María López",
      age: 34,
      pathology: "Lumbalgia crónica",
      email: "maria@email.com",
      phone: "5551234567",
      notes: "Dolor recurrente zona lumbar",
      status: "Activo",

      packages: {
        create: {
          packageType: "S5",
          totalPrice: 1250,
          status: "Adeudo",
          startDate: new Date("2025-09-22"),

          sessions: {
            createMany: {
              data: [
                {
                  sessionNumber: 1,
                  status: "Completada",
                  sessionDate: new Date("2025-09-22T12:00:00"),
                },
                {
                  sessionNumber: 2,
                  status: "Completada",
                  sessionDate: new Date("2025-09-24T12:00:00"),
                },
                { sessionNumber: 3, status: "Pendiente" },
                { sessionNumber: 4, status: "Pendiente" },
                { sessionNumber: 5, status: "Pendiente" },
              ],
            },
          },

          payments: {
            createMany: {
              data: [
                {
                  amount: 1000,
                  type: "Efectivo",
                  paymentDate: new Date("2025-09-22"),
                },
              ],
            },
          },
        },
      },
    },
  });

  /**
   * ============================
   * CLIENTE 2 — PAQUETE TERMINADO Y PAGADO
   * ============================
   */
  const juan = await prisma.client.create({
    data: {
      name: "Juan Pérez",
      age: 41,
      pathology: "Lesión de rodilla",
      email: "juan@email.com",
      phone: "5559876543",
      status: "Activo",

      packages: {
        create: {
          packageType: "S10",
          totalPrice: 2500,
          status: "Terminado",
          startDate: new Date("2025-07-01"),

          sessions: {
            createMany: {
              data: Array.from({ length: 10 }).map((_, i) => ({
                sessionNumber: i + 1,
                status: "Completada",
                sessionDate: new Date(2025, 6, i + 1, 10, 0),
              })),
            },
          },

          payments: {
            createMany: {
              data: [
                { amount: 1500, type: "Efectivo" },
                { amount: 1000, type: "Efectivo" },
              ],
            },
          },
        },
      },
    },
  });

  /**
   * ============================
   * CLIENTE 3 — SESIÓN INDIVIDUAL
   * ============================
   */
  const ana = await prisma.client.create({
    data: {
      name: "Ana Torres",
      age: 28,
      pathology: "Contractura cervical",
      status: "Activo",

      packages: {
        create: {
          packageType: "S1",
          totalPrice: 350,
          status: "Pagado",

          sessions: {
            create: {
              sessionNumber: 1,
              status: "Completada",
              sessionDate: new Date("2025-10-10T10:00:00"),
            },
          },

          payments: {
            create: {
              amount: 350,
              type: "Efectivo",
            },
          },
        },
      },
    },
  });

  /**
   * ============================
   * CITAS (CAL.COM SIMULADAS)
   * ============================
   */
  await prisma.appointment.createMany({
    data: [
      {
        clientId: maria.id,
        startTime: new Date("2025-10-28T18:00:00"),
        endTime: new Date("2025-10-28T19:00:00"),
        calEventId: "cal_evt_001",
      },
      {
        clientId: juan.id,
        startTime: new Date("2025-10-29T10:00:00"),
        endTime: new Date("2025-10-29T11:00:00"),
        calEventId: "cal_evt_002",
      },
    ],
  });

  console.log("✅ Seeding completed");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
