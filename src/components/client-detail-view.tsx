"use client"

import { useState, useEffect } from "react"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Plus, Eye, Trash2, CheckCircle2, Calendar, MoreHorizontal, DollarSign, CalendarCheck } from "lucide-react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createPackage } from "@/server/actions/create-package"
import { createPayment } from "@/server/actions/create-payment"
import { createSession } from "@/server/actions/create-session"
import { deletePackage } from "@/server/actions/delete-package"
import { deletePayment } from "@/server/actions/delete-payment"
import { deleteSession } from "@/server/actions/delete-session"
import { updatePayment } from "@/server/actions/update-payment"
import { updateSession } from "@/server/actions/update-session"
import { updateClient } from "@/server/actions/update-client"
import { updatePackage } from "@/server/actions/update-package"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

interface ClientDetailViewProps {
  client: {
    id: string
    name: string
    age: number
    email: string | null
    phone: string | null
    patologia: string
    notes: string | null
    status: string
    totalDebt: number
    activePackage: {
      id: string
      type: string
      sessionsRemaining: number
      sessionsTotal: number
      currentDebt: number
    } | null
  }
  packages: {
    id: string
    type: string
    cost: number
    paid: number
    debt: number
    sessionsCompleted: number
    sessionsTotal: number
    startDate: Date
    status: string
  }[]
  payments: {
    id: string
    date: Date
    amount: number
    method: string
    packageId: string
    packageType: string
    notes: string | null
  }[]
  sessions: {
    id: string
    sessionNumber: number
    date: Date | null
    packageId: string
    packageType: string
    status: string
  }[]
}

export function ClientDetailView({ client, packages, payments, sessions }: ClientDetailViewProps) {
  const [openAddPackage, setOpenAddPackage] = useState(false)
  const [openEditInfo, setOpenEditInfo] = useState(false)
  const [openAddPayment, setOpenAddPayment] = useState(false)
  const [openAddSession, setOpenAddSession] = useState(false)
  const [selectedPackageType, setSelectedPackageType] = useState("")
  const [activeTab, setActiveTab] = useState("info")
  // Filter state for history tab
  const [historyFilterId, setHistoryFilterId] = useState<string>("all")
  const [isCreatingPackage, setIsCreatingPackage] = useState(false)
  const router = useRouter()

  // --- EDIT INFO ACTION ---
  const [isUpdatingClient, setIsUpdatingClient] = useState(false)

  const updateClientSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    age: z.coerce.number().min(1, "La edad es requerida"),
    patologia: z.string().min(1, "La patología es requerida"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    status: z.enum(["Activo", "Inactivo"]),
  })

  type UpdateClientFormValues = z.input<typeof updateClientSchema>

  const editInfoForm = useForm<UpdateClientFormValues>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      name: client.name,
      age: client.age,
      patologia: client.patologia,
      email: client.email || "",
      phone: client.phone || "",
      notes: client.notes || "",
      status: client.status as "Activo" | "Inactivo",
    },
  })

  // Update form values if client prop changes
  useEffect(() => {
    editInfoForm.reset({
      name: client.name,
      age: client.age,
      patologia: client.patologia,
      email: client.email || "",
      phone: client.phone || "",
      notes: client.notes || "",
      status: client.status as "Activo" | "Inactivo",
    })
  }, [client, editInfoForm])


  async function onSubmitEditInfo(data: UpdateClientFormValues) {
    setIsUpdatingClient(true)

    const res = await updateClient({
      id: client.id,
      name: data.name,
      age: Number(data.age),
      patologia: data.patologia,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      status: data.status,
    })

    setIsUpdatingClient(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Información actualizada correctamente")
      setOpenEditInfo(false)
      router.refresh()
    }
  }

  const packageCosts: Record<string, number> = {
    "S1": 350,
    "S5": 1250,
    "S10": 2500,
    "S15": 3900,
    "S20": 5200,
  }

  const createPackageSchema = z.object({
    clientId: z.string().uuid(),
    packageType: z.enum(["S1", "S5", "S10", "S15", "S20"]),
    totalPrice: z.coerce.number().min(0, "El precio es requerido"),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Fecha inválida",
    }),
  })

  type PackageFormValues = z.input<typeof createPackageSchema>

  const packageForm = useForm<PackageFormValues>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      clientId: client.id,
      packageType: "S1",
      totalPrice: 0,
      startDate: new Date().toISOString().split('T')[0],
    },
  })

  // Watch package type to update price
  const watchedPackageType = packageForm.watch("packageType")
  useEffect(() => {
    if (watchedPackageType && packageCosts[watchedPackageType]) {
      packageForm.setValue("totalPrice", packageCosts[watchedPackageType])
    }
  }, [watchedPackageType])

  async function onSubmitPackage(data: PackageFormValues) {
    setIsCreatingPackage(true)
    const formattedData = {
      clientId: data.clientId,
      packageType: data.packageType,
      totalPrice: Number(data.totalPrice),
      startDate: new Date(data.startDate),
    }

    const res = await createPackage(formattedData)

    setIsCreatingPackage(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Paquete creado correctamente")
      packageForm.reset({
        clientId: client.id,
        packageType: "S1",
        totalPrice: packageCosts["S1"],
        startDate: new Date().toISOString().split('T')[0],
      })
      router.refresh()
      setOpenAddPackage(false)
    }
  }

  // --- PAYMENT ACTION ---
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)

  const createPaymentSchema = z.object({
    amount: z.coerce.number().min(1, "El monto es requerido"),
    paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Fecha inválida" }),
    method: z.enum(["Efectivo", "Otro"]),
    notes: z.string().optional(),
  })

  type PaymentFormValues = z.input<typeof createPaymentSchema>

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      method: "Efectivo",
      notes: "",
    },
  })

  async function onSubmitPayment(data: PaymentFormValues) {
    if (!selectedPackage) return
    setIsCreatingPayment(true)

    const res = await createPayment({
      packageId: selectedPackage.id,
      amount: Number(data.amount),
      paymentDate: new Date(data.paymentDate),
      method: data.method as "Efectivo" | "Otro",
      notes: data.notes,
    })

    setIsCreatingPayment(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Pago registrado correctamente")
      paymentForm.reset()
      router.refresh()
      setOpenAddPayment(false)
    }
  }

  // --- SESSION ACTION ---
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  const createSessionSchema = z.object({
    sessionDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Fecha inválida" }),
    sessionTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    status: z.enum(["Pendiente", "Completada", "Cancelada"]),
  })

  type SessionFormValues = z.input<typeof createSessionSchema>

  const sessionForm = useForm<SessionFormValues>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5),
      status: "Completada",
    },
  })

  async function onSubmitSession(data: SessionFormValues) {
    if (!selectedPackage) return
    setIsCreatingSession(true)

    // Combine date and time
    const dateTimeString = `${data.sessionDate}T${data.sessionTime}:00`
    const sessionDate = new Date(dateTimeString)

    const res = await createSession({
      packageId: selectedPackage.id,
      sessionDate: sessionDate,
      status: data.status as "Pendiente" | "Completada" | "Cancelada",
    })

    setIsCreatingSession(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Sesión registrada correctamente")
      sessionForm.reset()
      router.refresh()
      setOpenAddSession(false)
    }
  }

  // --- DELETE PACKAGE ACTION ---
  const [openDeletePackage, setOpenDeletePackage] = useState(false)
  const [isDeletingPackage, setIsDeletingPackage] = useState(false)

  async function onDeletePackage() {
    if (!selectedPackage) return
    setIsDeletingPackage(true)

    const res = await deletePackage({ packageId: selectedPackage.id })

    setIsDeletingPackage(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Paquete eliminado correctamente")
      router.refresh()
      setOpenDeletePackage(false)
    }
  }

  // --- DELETE PAYMENT ACTION ---
  const [selectedPayment, setSelectedPayment] = useState<{ id: string } | null>(null)
  const [openDeletePayment, setOpenDeletePayment] = useState(false)
  const [isDeletingPayment, setIsDeletingPayment] = useState(false)

  async function onDeletePayment() {
    if (!selectedPayment) return
    setIsDeletingPayment(true)

    // We pass clientId to the server action for revalidation
    const res = await deletePayment({ paymentId: selectedPayment.id, clientId: client.id })

    setIsDeletingPayment(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Pago eliminado correctamente")
      router.refresh()
      setOpenDeletePayment(false)
    }
  }

  // --- DELETE SESSION ACTION ---
  const [selectedSession, setSelectedSession] = useState<{ id: string } | null>(null)
  const [openDeleteSession, setOpenDeleteSession] = useState(false)
  const [isDeletingSession, setIsDeletingSession] = useState(false)

  async function onDeleteSession() {
    if (!selectedSession) return
    setIsDeletingSession(true)

    const res = await deleteSession({ sessionId: selectedSession.id, clientId: client.id })

    setIsDeletingSession(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Sesión eliminada correctamente")
      router.refresh()
      setOpenDeleteSession(false)
    }
  }



  // --- EDIT PAYMENT ACTION ---
  const [openEditPayment, setOpenEditPayment] = useState(false)
  const [isEditingPayment, setIsEditingPayment] = useState(false)
  const [editingPayment, setEditingPayment] = useState<typeof payments[0] | null>(null)

  const editPaymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      method: "Efectivo",
      notes: "",
    },
  })

  function onEditPaymentClick(payment: typeof payments[0]) {
    setEditingPayment(payment)
    editPaymentForm.reset({
      amount: payment.amount,
      paymentDate: new Date(payment.date).toISOString().split('T')[0],
      method: payment.method as "Efectivo" | "Otro",
      notes: payment.notes || "",
    })
    setOpenEditPayment(true)
  }

  async function onSubmitEditPayment(data: PaymentFormValues) {
    if (!editingPayment) return
    setIsEditingPayment(true)

    const res = await updatePayment({
      paymentId: editingPayment.id,
      amount: Number(data.amount),
      paymentDate: new Date(data.paymentDate),
      method: data.method as "Efectivo" | "Otro",
      notes: data.notes,
      clientId: client.id,
    })

    setIsEditingPayment(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Pago actualizado correctamente")
      setOpenEditPayment(false)
      router.refresh()
    }
  }

  // --- EDIT SESSION ACTION ---
  const [openEditSession, setOpenEditSession] = useState(false)
  const [isEditingSession, setIsEditingSession] = useState(false)
  const [editingSession, setEditingSession] = useState<typeof sessions[0] | null>(null)

  const editSessionForm = useForm<SessionFormValues>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: "00:00",
      status: "Completada",
    },
  })

  function onEditSessionClick(session: typeof sessions[0]) {
    setEditingSession(session)
    const dateObj = new Date(session.date || new Date())
    editSessionForm.reset({
      sessionDate: dateObj.toISOString().split('T')[0],
      sessionTime: dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }).slice(0, 5),
      status: session.status as "Pendiente" | "Completada" | "Cancelada",
    })
    setOpenEditSession(true)
  }

  async function onSubmitEditSession(data: SessionFormValues) {
    if (!editingSession) return
    setIsEditingSession(true)

    // Combine date and time
    const dateTimeString = `${data.sessionDate}T${data.sessionTime}:00`
    const sessionDate = new Date(dateTimeString)

    const res = await updateSession({
      sessionId: editingSession.id,
      sessionDate: sessionDate,
      status: data.status as "Pendiente" | "Completada" | "Cancelada",
      clientId: client.id,
    })

    setIsEditingSession(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Sesión actualizada correctamente")
      setOpenEditSession(false)
      router.refresh()
    }
  }

  // --- EDIT PACKAGE ACTION ---
  const [openEditPackage, setOpenEditPackage] = useState(false)
  const [isEditingPackage, setIsEditingPackage] = useState(false)
  const [editingPackage, setEditingPackage] = useState<typeof packages[0] | null>(null)

  const editPackageSchema = z.object({
    packageType: z.enum(["S1", "S5", "S10", "S15", "S20"]),
    totalPrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    status: z.enum(["Activo", "Adeudo", "Pagado", "Terminado"]),
  })

  type EditPackageFormValues = z.input<typeof editPackageSchema>

  const editPackageForm = useForm<EditPackageFormValues>({
    resolver: zodResolver(editPackageSchema),
    defaultValues: {
      packageType: "S1",
      totalPrice: 0,
      status: "Activo",
    },
  })

  // Watch package type to update price in edit form
  const watchedEditPackageType = editPackageForm.watch("packageType")
  useEffect(() => {
    if (openEditPackage && watchedEditPackageType && packageCosts[watchedEditPackageType]) {
      editPackageForm.setValue("totalPrice", packageCosts[watchedEditPackageType])
    }
  }, [watchedEditPackageType, openEditPackage])

  function onEditPackageClick(pkg: typeof packages[0]) {
    console.log("Edit package clicked", pkg)
    setEditingPackage(pkg)
    editPackageForm.reset({
      packageType: pkg.type as "S1" | "S5" | "S10" | "S15" | "S20",
      totalPrice: pkg.cost,
      status: pkg.status as "Activo" | "Adeudo" | "Pagado" | "Terminado",
    })
    setOpenEditPackage(true)
    console.log("Modal should open now, openEditPackage:", true)
  }

  async function onSubmitEditPackage(data: EditPackageFormValues) {
    if (!editingPackage) return
    setIsEditingPackage(true)

    const res = await updatePackage({
      packageId: editingPackage.id,
      clientId: client.id,
      packageType: data.packageType,
      totalPrice: Number(data.totalPrice),
      status: data.status,
    })

    setIsEditingPackage(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Paquete actualizado correctamente")
      setOpenEditPackage(false)
      router.refresh()
    }
  }

  const packageNames: Record<string, string> = {
    "S1": "1 sesión",
    "S5": "5 sesiones",
    "S10": "10 sesiones",
    "S15": "15 sesiones",
    "S20": "20 sesiones",
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date | string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filtered lists
  const filteredPayments = historyFilterId === "all"
    ? payments
    : payments.filter(p => p.packageId === historyFilterId)

  const filteredSessions = historyFilterId === "all"
    ? sessions
    : sessions.filter(s => s.packageId === historyFilterId)

  return (
    <div className="">
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mx-auto space-y-6 px-4 xl:px-12">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                ← Volver a clientes
              </Link>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                <p className="text-muted-foreground mt-1">{client.patologia}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="px-4 py-2" variant={client.status === "Activo" ? "default" : "secondary"}>{client.status}</Badge>
                {client.totalDebt > 0 && (
                  <Badge className="px-4 py-2" variant="destructive">Adeudo: {formatCurrency(client.totalDebt)}</Badge>
                )}
                {client.activePackage && <Badge className="px-4 py-2" variant="outline">{packageNames[client.activePackage.type] || client.activePackage.type}</Badge>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="packages">Paquetes</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            {/* TAB 1: Información */}
            <TabsContent value="info" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Datos del cliente</CardTitle>
                        <CardDescription className="mt-2 mb-2">Información personal y médica</CardDescription>
                      </div>
                      <Dialog open={openEditInfo} onOpenChange={setOpenEditInfo}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <form onSubmit={editInfoForm.handleSubmit(onSubmitEditInfo)}>
                            <DialogHeader>
                              <DialogTitle>Editar información del cliente</DialogTitle>
                              <DialogDescription>
                                Actualiza los datos personales y médicos del cliente
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <FieldGroup>
                                <Controller
                                  control={editInfoForm.control}
                                  name="name"
                                  render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel htmlFor="edit-name">Nombre completo</FieldLabel>
                                      <Input {...field} id="edit-name" />
                                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                  )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                  <Controller
                                    control={editInfoForm.control}
                                    name="age"
                                    render={({ field, fieldState }) => (
                                      <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="edit-age">Edad</FieldLabel>
                                        <Input
                                          {...field}
                                          id="edit-age"
                                          type="number"
                                          value={(field.value as number | string) ?? ""}
                                          onChange={e => field.onChange(e.target.value)}
                                        />
                                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                      </Field>
                                    )}
                                  />
                                  <Controller
                                    control={editInfoForm.control}
                                    name="phone"
                                    render={({ field, fieldState }) => (
                                      <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="edit-phone">Teléfono</FieldLabel>
                                        <Input {...field} id="edit-phone" />
                                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                      </Field>
                                    )}
                                  />
                                </div>

                                <Controller
                                  control={editInfoForm.control}
                                  name="email"
                                  render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                                      <Input {...field} id="edit-email" type="email" />
                                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                  )}
                                />

                                <Controller
                                  control={editInfoForm.control}
                                  name="patologia"
                                  render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel htmlFor="edit-patologia">Patología</FieldLabel>
                                      <Input {...field} id="edit-patologia" />
                                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                  )}
                                />

                                <Controller
                                  control={editInfoForm.control}
                                  name="notes"
                                  render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel htmlFor="edit-notes">Notas</FieldLabel>
                                      <Textarea {...field} id="edit-notes" rows={4} />
                                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                  )}
                                />

                                <Controller
                                  control={editInfoForm.control}
                                  name="status"
                                  render={({ field }) => (
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-status">Estatus</Label>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="w-1/2" id="edit-status">
                                          <SelectValue placeholder="Selecciona el estatus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Activo">Activo</SelectItem>
                                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                />
                              </FieldGroup>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button variant="outline" type="button" onClick={() => setOpenEditInfo(false)}>
                                Cancelar
                              </Button>
                              <Button type="submit" disabled={isUpdatingClient}>
                                {isUpdatingClient ? "Guardando..." : "Guardar cambios"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-8 sm:grid-cols-2">
                        <div>
                          <Label className="text-muted-foreground mb-2">Nombre</Label>
                          <p className="font-medium mt-1">{client.name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Edad</Label>
                          <p className="font-medium mt-1">{client.age} años</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Email</Label>
                          {client.email ? (
                            // if text is too long, apply tailwind classes to truncate it
                            <p className="font-medium mt-1 truncate">{client.email}</p>
                          ) : (
                            <p className="font-medium mt-1 text-destructive">No proporcionado</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Teléfono</Label>
                          {client.phone ? (
                            <p className="font-medium mt-1">{client.phone}</p>
                          ) : (
                            <p className="font-medium mt-1 text-destructive">No proporcionado</p>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-muted-foreground">Patología</Label>
                          <p className="font-medium mt-1">{client.patologia}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-muted-foreground">Notas</Label>
                          <p className="text-sm mt-1 leading-relaxed">{client.notes || "Sin notas"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen</CardTitle>
                      <CardDescription>Estado actual del cliente</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-7">
                      {client.activePackage ? (
                        <>
                          <div>
                            <Label className="text-muted-foreground text-sm">Paquete actual</Label>
                            <p className="font-semibold text-lg mt-1">{packageNames[client.activePackage.type] || client.activePackage.type}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-sm">Sesiones restantes</Label>
                            {/* if 0 show "No hay sesiones restantes" */}
                            {client.activePackage.sessionsRemaining === 0 ? (
                              <p className="font-semibold text-lg mt-1">Completadas</p>
                            ) : (
                              <p className="font-semibold text-lg mt-1">{client.activePackage.sessionsRemaining}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-sm">Adeudo actual</Label>
                            <p className={`font-semibold text-lg mt-1 ${client.activePackage.currentDebt > 0 ? "text-destructive" : "text-green-600"}`}>
                              {formatCurrency(client.activePackage.currentDebt)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground">No hay paquete activo</div>
                      )}

                      <Button className="w-full" onClick={() => {
                        setActiveTab("packages")
                        setOpenAddPackage(true)
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar paquete
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Paquetes */}
            <TabsContent value="packages" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Paquetes del cliente</h2>
                  <p className="text-muted-foreground">Gestiona los paquetes de sesiones</p>
                </div>
                <Dialog open={openAddPackage} onOpenChange={setOpenAddPackage}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar paquete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={packageForm.handleSubmit(onSubmitPackage)}>
                      <DialogHeader>
                        <DialogTitle>Agregar nuevo paquete</DialogTitle>
                        <DialogDescription>Crea un nuevo paquete de sesiones para el cliente</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <FieldGroup>
                          <Controller
                            control={packageForm.control}
                            name="packageType"
                            render={({ field }) => (
                              <div className="grid gap-4">
                                <Label htmlFor="package-type">Tipo de paquete</Label>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger id="package-type">
                                    <SelectValue placeholder="Selecciona un paquete" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="S1">1 sesión</SelectItem>
                                    <SelectItem value="S5">5 sesiones</SelectItem>
                                    <SelectItem value="S10">10 sesiones</SelectItem>
                                    <SelectItem value="S15">15 sesiones</SelectItem>
                                    <SelectItem value="S20">20 sesiones</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />

                          <div className="grid gap-6">
                            <Controller
                              control={packageForm.control}
                              name="totalPrice"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor="package-price">Costo total</FieldLabel>
                                  <Input
                                    {...field}
                                    id="package-price"
                                    type="number"
                                    value={(field.value as number | string) ?? ""}
                                    onChange={e => field.onChange(e.target.valueAsNumber)}
                                  />
                                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                              )}
                            />

                            <Controller
                              control={packageForm.control}
                              name="startDate"
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor="package-date">Fecha de inicio</FieldLabel>
                                  <Input {...field} id="package-date" type="date" />
                                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                                </Field>
                              )}
                            />
                          </div>
                        </FieldGroup>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpenAddPackage(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isCreatingPackage}>
                          {isCreatingPackage ? "Guardando..." : "Guardar paquete"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* MODAL EDITAR PAQUETE */}
                <Dialog open={openEditPackage} onOpenChange={setOpenEditPackage}>
                  <DialogContent>
                    <form onSubmit={editPackageForm.handleSubmit(onSubmitEditPackage)}>
                      <DialogHeader>
                        <DialogTitle>Editar paquete</DialogTitle>
                        <DialogDescription>Modificar los detalles del paquete</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <FieldGroup>
                          <Controller
                            control={editPackageForm.control}
                            name="packageType"
                            render={({ field }) => (
                              <div className="grid gap-2">
                                <Label htmlFor="edit-package-type">Tipo de paquete</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger id="edit-package-type">
                                    <SelectValue placeholder="Selecciona el tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="S1">1 sesión</SelectItem>
                                    <SelectItem value="S5">5 sesiones</SelectItem>
                                    <SelectItem value="S10">10 sesiones</SelectItem>
                                    <SelectItem value="S15">15 sesiones</SelectItem>
                                    <SelectItem value="S20">20 sesiones</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />

                          <Controller
                            control={editPackageForm.control}
                            name="totalPrice"
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="edit-package-price">Precio total</FieldLabel>
                                <Input
                                  {...field}
                                  id="edit-package-price"
                                  type="number"
                                  value={(field.value as number | string) ?? ""}
                                  onChange={e => field.onChange(e.target.value)}
                                />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />

                          <Controller
                            control={editPackageForm.control}
                            name="status"
                            render={({ field }) => (
                              <div className="grid gap-2">
                                <Label htmlFor="edit-package-status">Estatus</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger id="edit-package-status">
                                    <SelectValue placeholder="Selecciona el estatus" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Activo">Activo</SelectItem>
                                    <SelectItem value="Adeudo">Adeudo</SelectItem>
                                    <SelectItem value="Pagado">Pagado</SelectItem>
                                    <SelectItem value="Terminado">Terminado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />
                        </FieldGroup>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpenEditPackage(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isEditingPackage}>
                          {isEditingPackage ? "Guardando..." : "Guardar cambios"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="p-4">Tipo de paquete</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead>Pagado</TableHead>
                      <TableHead>Adeudo</TableHead>
                      <TableHead>Sesiones</TableHead>
                      <TableHead>Fecha inicio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right pr-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium p-6">{packageNames[pkg.type] || pkg.type}</TableCell>
                        <TableCell>{formatCurrency(pkg.cost)}</TableCell>
                        <TableCell className="text-green-600 dark:text-green-400">
                          {formatCurrency(pkg.paid)}
                        </TableCell>
                        <TableCell className={pkg.debt > 0 ? "text-destructive" : ""}>
                          {formatCurrency(pkg.debt)}
                        </TableCell>
                        <TableCell>
                          {pkg.sessionsCompleted} / {pkg.sessionsTotal}
                        </TableCell>
                        <TableCell>{formatDate(pkg.startDate)}</TableCell>
                        <TableCell>
                          <Badge variant={pkg.status === "Activo" ? "default" : "secondary"}>{pkg.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPackage(pkg)
                                  setOpenAddPayment(true)
                                }}
                              >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Agregar pago
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPackage(pkg)
                                  setOpenAddSession(true)
                                }}
                              >
                                <CalendarCheck className="mr-2 h-4 w-4" />
                                Agregar asistencia
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onEditPackageClick(pkg)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar paquete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => {
                                  setSelectedPackage(pkg)
                                  setOpenDeletePackage(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar paquete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {packages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No hay paquetes registrados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* MODAL AGREGAR PAGO */}
              <Dialog open={openAddPayment} onOpenChange={setOpenAddPayment}>
                <DialogContent>
                  <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)}>
                    <DialogHeader>
                      <DialogTitle>Agregar pago</DialogTitle>
                      <DialogDescription>Registrar un nuevo pago para el cliente</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FieldGroup>
                        <Controller
                          control={paymentForm.control}
                          name="amount"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="pay-amount">Monto</FieldLabel>
                              <Input
                                {...field}
                                id="pay-amount"
                                type="number"
                                value={(field.value as number | string) ?? ""}
                                onChange={e => field.onChange(e.target.value)}
                              />
                              {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          control={paymentForm.control}
                          name="paymentDate"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="pay-date">Fecha</FieldLabel>
                              <Input {...field} id="pay-date" type="date" />
                              {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          control={paymentForm.control}
                          name="method"
                          render={({ field }) => (
                            <div className="grid gap-2">
                              <Label htmlFor="pay-method">Método</Label>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="pay-method">
                                  <SelectValue placeholder="Selecciona el método" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                                  <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />
                        <Controller
                          control={paymentForm.control}
                          name="notes"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="pay-notes">Notas (opcional)</FieldLabel>
                              <Textarea {...field} id="pay-notes" rows={3} />
                              {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setOpenAddPayment(false)}>Cancelar</Button>
                      <Button type="submit" disabled={isCreatingPayment}>
                        {isCreatingPayment ? "Guardando..." : "Guardar pago"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* MODAL AGREGAR SESION */}
              <Dialog open={openAddSession} onOpenChange={setOpenAddSession}>
                <DialogContent>
                  <form onSubmit={sessionForm.handleSubmit(onSubmitSession)}>
                    <DialogHeader>
                      <DialogTitle>Agregar sesión</DialogTitle>
                      <DialogDescription>Registrar asistencia a una sesión</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                          <Controller
                            control={sessionForm.control}
                            name="sessionDate"
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="session-date">Fecha</FieldLabel>
                                <Input {...field} id="session-date" type="date" />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />
                          <Controller
                            control={sessionForm.control}
                            name="sessionTime"
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="session-time">Hora</FieldLabel>
                                <Input {...field} id="session-time" type="time" />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />
                        </div>

                        <Controller
                          control={sessionForm.control}
                          name="status"
                          render={({ field }) => (
                            <div className="grid gap-2">
                              <Label htmlFor="session-status">Estatus</Label>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="session-status">
                                  <SelectValue placeholder="Selecciona el estatus" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Completada">Completada</SelectItem>
                                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setOpenAddSession(false)}>Cancelar</Button>
                      <Button type="submit" disabled={isCreatingSession}>
                        {isCreatingSession ? "Guardando..." : "Guardar sesión"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* MODAL ELIMINAR PAQUETE */}
              <Dialog open={openDeletePackage} onOpenChange={setOpenDeletePackage}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Estás seguro?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. Se eliminará el paquete y todos los registros asociados.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenDeletePackage(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={onDeletePackage} disabled={isDeletingPackage}>
                      {isDeletingPackage ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </TabsContent>

            {/* TAB 3: Historial */}
            <TabsContent value="history" className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Historial del cliente</h2>
                  <p className="text-muted-foreground">Registro completo de pagos y sesiones</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <Select value={historyFilterId} onValueChange={setHistoryFilterId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por paquete" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los paquetes</SelectItem>
                        {packages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {packageNames[pkg.type] || pkg.type} - {formatDate(pkg.startDate)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </div>

              {/* Historial de pagos */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial de pagos</CardTitle>
                  <CardDescription>Todos los pagos realizados por el cliente</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="p-4">Fecha</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Paquete relacionado</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2 p-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(payment.date)}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>{packageNames[payment.packageType] || payment.packageType}</TableCell>
                          <TableCell className="text-muted-foreground">{payment.notes || "—"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menú</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => onEditPaymentClick(payment)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar pago
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => {
                                    setSelectedPayment({ id: payment.id })
                                    setOpenDeletePayment(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar pago
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredPayments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No hay pagos registrados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Historial de sesiones */}
              <Card>
                <CardHeader>
                  <CardTitle>Historial de sesiones</CardTitle>
                  <CardDescription>Registro de todas las sesiones realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número de sesión</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Paquete</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">Sesión #{session.sessionNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 p-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(session.date)}
                            </div>
                          </TableCell>
                          <TableCell>{formatTime(session.date)}</TableCell>
                          <TableCell>{packageNames[session.packageType] || session.packageType}</TableCell>
                          <TableCell>
                            <Badge variant={session.status === "Completada" ? "default" : "secondary"}>
                              {session.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menú</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => onEditSessionClick(session)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar sesión
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => {
                                    setSelectedSession({ id: session.id })
                                    setOpenDeleteSession(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar sesión
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredSessions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No hay sesiones registradas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* MODAL ELIMINAR PAGO */}
              <Dialog open={openDeletePayment} onOpenChange={setOpenDeletePayment}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Eliminar pago?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenDeletePayment(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={onDeletePayment} disabled={isDeletingPayment}>
                      {isDeletingPayment ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* MODAL ELIMINAR SESION */}
              <Dialog open={openDeleteSession} onOpenChange={setOpenDeleteSession}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Eliminar sesión?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenDeleteSession(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={onDeleteSession} disabled={isDeletingSession}>
                      {isDeletingSession ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* MODAL EDITAR PAGO */}
              <Dialog open={openEditPayment} onOpenChange={setOpenEditPayment}>
                <DialogContent>
                  <form onSubmit={editPaymentForm.handleSubmit(onSubmitEditPayment)}>
                    <DialogHeader>
                      <DialogTitle>Editar pago</DialogTitle>
                      <DialogDescription>Modificar los detalles del pago</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FieldGroup>
                        <Controller
                          control={editPaymentForm.control}
                          name="amount"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="edit-pay-amount">Monto</FieldLabel>
                              <Input
                                {...field}
                                id="edit-pay-amount"
                                type="number"
                                value={(field.value as number | string) ?? ""}
                                onChange={e => field.onChange(e.target.valueAsNumber)}
                              />
                              {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          control={editPaymentForm.control}
                          name="paymentDate"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="edit-pay-date">Fecha</FieldLabel>
                              <Input {...field} id="edit-pay-date" type="date" />
                              {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          control={editPaymentForm.control}
                          name="method"
                          render={({ field }) => (
                            <div className="grid gap-2">
                              <Label htmlFor="edit-pay-method">Método</Label>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="edit-pay-method">
                                  <SelectValue placeholder="Selecciona el método" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                                  <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />
                        <Controller
                          control={editPaymentForm.control}
                          name="notes"
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="edit-pay-notes">Notas (opcional)</FieldLabel>
                              <Textarea {...field} id="edit-pay-notes" rows={3} />
                              {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setOpenEditPayment(false)}>Cancelar</Button>
                      <Button type="submit" disabled={isEditingPayment}>
                        {isEditingPayment ? "Guardando..." : "Guardar cambios"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* MODAL EDITAR SESION */}
              <Dialog open={openEditSession} onOpenChange={setOpenEditSession}>
                <DialogContent>
                  <form onSubmit={editSessionForm.handleSubmit(onSubmitEditSession)}>
                    <DialogHeader>
                      <DialogTitle>Editar sesión</DialogTitle>
                      <DialogDescription>Modificar los detalles de la sesión</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                          <Controller
                            control={editSessionForm.control}
                            name="sessionDate"
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="edit-session-date">Fecha</FieldLabel>
                                <Input {...field} id="edit-session-date" type="date" />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />
                          <Controller
                            control={editSessionForm.control}
                            name="sessionTime"
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="edit-session-time">Hora</FieldLabel>
                                <Input {...field} id="edit-session-time" type="time" />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />
                        </div>

                        <Controller
                          control={editSessionForm.control}
                          name="status"
                          render={({ field }) => (
                            <div className="grid gap-2">
                              <Label htmlFor="edit-session-status">Estatus</Label>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="edit-session-status">
                                  <SelectValue placeholder="Selecciona el estatus" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Completada">Completada</SelectItem>
                                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />
                      </FieldGroup>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setOpenEditSession(false)}>Cancelar</Button>
                      <Button type="submit" disabled={isEditingSession}>
                        {isEditingSession ? "Guardando..." : "Guardar cambios"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
