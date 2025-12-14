import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { dashboardClients, clientInfo, clientPackages, payments, sesionesPorPaquete } from "./mock-data";

export default function DashboardExample() {
  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={dashboardClients} />
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nombre:</strong> {clientInfo.nombre}</p>
            <p><strong>Edad:</strong> {clientInfo.edad}</p>
            <p><strong>Email:</strong> {clientInfo.email}</p>
            <p><strong>Teléfono:</strong> {clientInfo.telefono}</p>
            <p><strong>Patología:</strong> {clientInfo.patologia}</p>
            <p><strong>Notas:</strong> {clientInfo.notas}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Paquetes Contratados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientPackages.map((p) => (
              <div key={p.id} className="border p-4 rounded-xl bg-muted/50">
                <p><strong>Paquete:</strong> {p.nombrePaquete}</p>
                <p><strong>Fecha:</strong> {p.fechaAdquisicion}</p>
                <p><strong>Total:</strong> ${p.costoTotal}</p>
                <p><strong>Pagado:</strong> ${p.pagosRealizados}</p>
                <p><strong>Adeudo:</strong> ${p.adeudo}</p>
                <p><strong>Estatus:</strong> {p.estatus}</p>
                <p><strong>Sesiones:</strong> {p.sesionesRealizadas} / {p.sesionesTotales}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Sesiones del Paquete</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Número</th>
                <th>Fecha</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              {sesionesPorPaquete.map((s) => (
                <tr key={s.numero} className="border-b">
                  <td className="py-2">{s.numero}</td>
                  <td>{s.fecha || "Pendiente"}</td>
                  <td>{s.estatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
