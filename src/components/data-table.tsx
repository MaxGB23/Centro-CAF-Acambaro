"use client"

import * as React from "react"
import Link from "next/link"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
  IconSearch,
  IconFilter,
  IconX,
  IconTrash,
} from "@tabler/icons-react"
import { deleteClient } from "@/server/actions/delete-client"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/server/actions/create-client"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export const schema = z.object({
  id: z.string(),
  nombre: z.string(),
  edad: z.number(),
  patologia: z.string(),
  paqueteActivo: z.enum(["S1", "S5", "S10", "S15", "S20"]).nullable(),
  sesiones: z.string(),
  estatusCliente: z.enum(["Activo", "Inactivo"]),
  estatusPaquete: z.enum(["Activo", "Terminado"]).nullable(),
  adeudo: z.number(),
  siguienteSesion: z.date().nullable(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const packageMap: Record<string, string> = {
  S1: "1 Sesión",
  S5: "5 Sesiones",
  S10: "10 Sesiones",
  S15: "15 Sesiones",
  S20: "20 Sesiones",
}

function ClientActions({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const router = useRouter()

  async function onDelete() {
    setIsDeleting(true)
    const result = await deleteClient(id)
    setIsDeleting(false)
    setShowDeleteDialog(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Cliente eliminado correctamente")
      router.refresh()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            variant="default"
            onSelect={() => setShowDeleteDialog(true)}
          >
            <IconTrash className="mr-2 h-4 w-4 text-destructive" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás completamente seguro?</DialogTitle>
            <DialogDescription className="py-4">
              Esta acción no se puede deshacer. Esto eliminará permanentemente al
              cliente y todos sus datos asociados (paquetes, sesiones y pagos).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar cliente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/cliente/${row.original.id}`}
        className="text-primary font-medium  hover:text-blue-700 dark:hover:text-blue-300"
      >
        {row.original.nombre}
      </Link>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "edad",
    header: "Edad",
    cell: ({ row }) => (
      <div className="text-sm pl-1">
        {row.original.edad}
      </div>
    ),
  }, {
    accessorKey: "patologia",
    header: "Patología",
    cell: ({ row }) => (
      // el texto salta de la celda, hacer que se ajuste a la celda
      <div className="text-sm whitespace-normal break-words">
        {row.original.patologia}
      </div>
    ),
  },
  {
    accessorKey: "paqueteActivo",
    header: "Paquete",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.paqueteActivo ? packageMap[row.original.paqueteActivo] : "Sin paquete"}
      </div>
    ),
  },
  {
    accessorKey: "sesiones",
    header: "Sesiones",
    cell: ({ row }) => (
      <div className="text-sm pl-1.5">
        {/* sesiones usadas / total de sesiones del paquete */}

        {row.original.sesiones}

      </div>
    ),
  },

  {
    accessorKey: "estatusCliente",
    header: "Estatus Cliente",
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true
      return String(row.getValue(columnId)) === String(filterValue)
    },
    cell: ({ row }) => (
      <>
        {row.original.estatusCliente === "Activo" && (
          <Badge variant="outline" className="gap-1.5 p-4 py-2 text-sm">
            <IconCircleCheckFilled className="text-green-500 dark:text-emerald-400" />
            Activo
          </Badge>
        )}
        {row.original.estatusCliente === "Inactivo" && (
          <Badge variant="outline" className="gap-1.5 p-4 py-2 text-sm bg-gray-50 text-black dark:bg-neutral-900 dark:text-white">
            <IconX className="text-destructive dark:text-pink-400" />
            Inactivo
          </Badge>
        )}
      </>
    ),
  },
  {
    accessorKey: "estatusPaquete",
    header: "Estatus Paquete",
    cell: ({ row }) => (
      <>
        {row.original.estatusPaquete === "Activo" ? (
          row.original.adeudo <= 0 ? (
            <Badge
              variant="outline" className="gap-1.5 p-4 py-2 text-sm">
              <IconCircleCheckFilled className="text-blue-500 dark:text-cyan-400" />
              Activo/Pagado
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 p-4 py-2 text-sm"
            >
              <IconCircleCheckFilled className="text-destructive dark:text-pink-500" />
              Activo/Adeudo
            </Badge>
          )
        ) : row.original.estatusPaquete === "Terminado" ? (
          <Badge
            variant="outline"
            className="gap-1.5 p-4 py-2 text-sm"
          >
            <IconCircleCheckFilled />
            Concluido
          </Badge>
        ) : (
          <div className="text-sm text-muted-foreground pl-2">Sin paquete</div>
        )}
      </>
    ),
  },

  {
    accessorKey: "adeudo",
    header: "Adeudo",
    cell: ({ row }) => (
      <div className={` ${row.original.adeudo > 0 ? "text-red-500 font-semibold dark:text-destructive text-lg" : "text-black dark:text-white"}`}>
        {row.original.adeudo === 0 ? "Al corriente" : `$${row.original.adeudo}`}
      </div>
    ),
  },
  {
    accessorKey: "Cita",
    header: "Próxima Cita",
    cell: ({ row }) => {
      const date = row.original.siguienteSesion

      if (!date) return <div className="text-sm text-muted-foreground">No programada</div>

      return (
        // coloca arriba la fecha y abajo el tiempo restante
        <div className="text-sm">
          <div className="">
            {/* el formato de fecha debe ser ejemplo 12 de Mayo y español */}
            {format(new Date(date), "dd 'de' MMMM", { locale: es })}
          </div>
          <span className="text-xs text-muted-foreground">
            Cita {formatDistanceToNow(new Date(date), {
              addSuffix: true,
              locale: es,
            })}
          </span>

        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ClientActions id={row.original.id} />,
  },

]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const router = useRouter()

  const [openCreateClient, setOpenCreateClient] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)

  const clientFormSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    age: z.coerce.number().min(1, "La edad es requerida"),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    pathology: z.string().min(1, "La patología es requerida"),
    notes: z.string().optional(),
  })

  type ClientFormValues = z.input<typeof clientFormSchema>

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      age: 0,
      phone: "",
      email: "",
      pathology: "",
      notes: "",
    },
  })

  async function onSubmit(data: ClientFormValues) {
    setIsCreating(true)

    // Ensure values are coerced/validated to the expected output types
    const parsed = clientFormSchema.parse(data)

    const res = await createClient(parsed)

    setIsCreating(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Cliente creado correctamente")
      form.reset()
      router.refresh()
      setOpenCreateClient(false)
    }
  }


  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={(table.getColumn("nombre")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("nombre")?.setFilterValue(event.target.value)
                }
                className="pl-9"
              />
            </div>
            {table.getColumn("estatusCliente") && (
              <div className="flex items-center space-x-2">
                <Select
                  value={(table.getColumn("estatusCliente")?.getFilterValue() as string) ?? "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      table.getColumn("estatusCliente")?.setFilterValue(undefined)
                    } else {
                      table.getColumn("estatusCliente")?.setFilterValue(value)
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <IconFilter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Activo">Cliente Activo</SelectItem>
                    <SelectItem value="Inactivo">Cliente Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                {table.getState().columnFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => table.resetColumnFilters()}
                    className="h-8 px-2 lg:px-3"
                  >
                    Reset
                    <IconX className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Columnas</span>
                  <span className="lg:hidden">Columnas</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={openCreateClient} onOpenChange={setOpenCreateClient}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconPlus />
                  <span className="hidden lg:inline">Agregar Cliente</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Agregar nuevo cliente</DialogTitle>
                    <DialogDescription>
                      Ingresa los datos del nuevo cliente para registrarlo en el sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <FieldGroup>
                      <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="gap-0.5" htmlFor="name">Nombre completo<span className="text-red-500">*</span></FieldLabel>
                            <Input {...field} id="name" placeholder="Nombre del cliente" />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name="age"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel className="gap-0.5" htmlFor="age">Edad<span className="text-red-500">*</span></FieldLabel>
                              <Input
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={(field.value as number | string) ?? ""}
                                onChange={e => field.onChange(e.target.value)}
                                id="age"
                                type="number"
                                placeholder="Ej. 30"
                              />
                              {fieldState.error && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name="phone"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="phone">Teléfono (opcional)</FieldLabel>
                              <Input {...field} id="phone" placeholder="55 1234 5678" />
                              {fieldState.error && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </div>

                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="email">Email (opcional)</FieldLabel>
                            <Input {...field} id="email" type="email" placeholder="cliente@ejemplo.com" />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="pathology"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="gap-0.5" htmlFor="pathology">Patología<span className="text-red-500">*</span></FieldLabel>
                            <Input {...field} id="pathology" placeholder="Ej. Dolor lumbar" />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="notes"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
                            <Textarea {...field} id="notes" rows={3} placeholder="Observaciones adicionales" />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setOpenCreateClient(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar cliente"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} seleccionados.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className=" items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="hidden lg:inline-block text-sm font-medium">
                Resultados
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig
