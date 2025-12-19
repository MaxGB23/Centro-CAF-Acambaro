/*
  Warnings:

  - The values [Empleado] on the enum `Position` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('Activo', 'Inactivo');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('Activo', 'Adeudo', 'Pagado', 'Terminado');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('S1', 'S5', 'S10', 'S15', 'S20');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('Pendiente', 'Asistida', 'Cancelada');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('Efectivo', 'Otro');

-- AlterEnum
BEGIN;
CREATE TYPE "Position_new" AS ENUM ('Fisioterapeuta', 'Secretaria', 'Secretario', 'Otro');
ALTER TABLE "public"."user" ALTER COLUMN "position" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "position" TYPE "Position_new" USING ("position"::text::"Position_new");
ALTER TYPE "Position" RENAME TO "Position_old";
ALTER TYPE "Position_new" RENAME TO "Position";
DROP TYPE "public"."Position_old";
ALTER TABLE "user" ALTER COLUMN "position" SET DEFAULT 'Otro';
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'Editor';

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "position" SET DEFAULT 'Otro';

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "pathology" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'Activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_packages" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "packageType" "PackageType" NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "status" "PackageStatus" NOT NULL DEFAULT 'Activo',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_records" (
    "id" TEXT NOT NULL,
    "clientPackageId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "sessionDate" TIMESTAMP(3),
    "status" "SessionStatus" NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "clientPackageId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "PaymentType" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "calEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_packages_clientId_idx" ON "client_packages"("clientId");

-- CreateIndex
CREATE INDEX "session_records_clientPackageId_idx" ON "session_records"("clientPackageId");

-- CreateIndex
CREATE INDEX "payments_clientPackageId_idx" ON "payments"("clientPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_calEventId_key" ON "appointments"("calEventId");

-- CreateIndex
CREATE INDEX "appointments_clientId_idx" ON "appointments"("clientId");

-- AddForeignKey
ALTER TABLE "client_packages" ADD CONSTRAINT "client_packages_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_records" ADD CONSTRAINT "session_records_clientPackageId_fkey" FOREIGN KEY ("clientPackageId") REFERENCES "client_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_clientPackageId_fkey" FOREIGN KEY ("clientPackageId") REFERENCES "client_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
