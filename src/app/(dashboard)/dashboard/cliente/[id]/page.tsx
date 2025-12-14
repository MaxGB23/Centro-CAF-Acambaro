"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Clock, CheckCircle2 } from "lucide-react";




interface Attendance {
  id: string;
  date: string;
  time: string;
  status: "present" | "absent" | "late";
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  type: "full" | "advance";
  description: string;
}

export default function ClientProfilePage({ params }: { params: { id: string } }) {
  const [attendances] = useState<Attendance[]>([
    { id: "1", date: "2024-01-15", time: "10:00 AM", status: "present" },
    { id: "2", date: "2024-01-16", time: "10:05 AM", status: "late" },
    { id: "3", date: "2024-01-17", time: "10:00 AM", status: "present" },
  ]);

  const [payments] = useState<Payment[]>([
    { id: "1", date: "2024-01-10", amount: 5000, type: "full", description: "Sesiones enero" },
    { id: "2", date: "2024-01-20", amount: 2500, type: "advance", description: "Adelanto" },
  ]);

  const totalSessions = attendances.length;
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalAdvance = payments.filter(p => p.type === "advance").reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800";
      case "late": return "bg-yellow-100 text-yellow-800";
      case "absent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <h1 className="text-3xl font-bold text-gray-900">Perfil del Cliente</h1>
          <p className="text-gray-500 mt-2">ID: {params.id}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPayments.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adelantos</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAdvance.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencias</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendances.filter(a => a.status === "present").length}/{totalSessions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="attendance" className="bg-white rounded-lg shadow-sm">
          <TabsList className="w-full grid grid-cols-3 rounded-t-lg bg-gray-100">
            <TabsTrigger value="attendance">Asistencias</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="advances">Adelantos</TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="p-6">
            <div className="space-y-3">
              {attendances.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{att.date}</p>
                      <p className="text-sm text-gray-500">{att.time}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(att.status)}>
                    {att.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="p-6">
            <div className="space-y-3">
              {payments.filter(p => p.type === "full").map((pay) => (
                <div key={pay.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{pay.description}</p>
                    <p className="text-sm text-gray-500">{pay.date}</p>
                  </div>
                  <p className="font-bold text-green-600">${pay.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Advances Tab */}
          <TabsContent value="advances" className="p-6">
            <div className="space-y-3">
              {payments.filter(p => p.type === "advance").map((pay) => (
                <div key={pay.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{pay.description}</p>
                    <p className="text-sm text-gray-500">{pay.date}</p>
                  </div>
                  <p className="font-bold text-orange-600">${pay.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700">Nueva Asistencia</Button>
          <Button className="bg-green-600 hover:bg-green-700">Registrar Pago</Button>
          <Button variant="outline">Descargar Reporte</Button>
        </div>
      </div>
    </div>
  );
}