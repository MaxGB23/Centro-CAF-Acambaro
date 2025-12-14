import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<any>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "edad", header: "Edad" },
  { accessorKey: "patologia", header: "Patología" },
  { accessorKey: "paquete", header: "Paquete" },
  { accessorKey: "estatus", header: "Estatus" },
  { accessorKey: "pago", header: "Pago" }
];
