import { IconTrendingDown, IconTrendingUp, IconUser } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  data: any[]
  stats: {
    activeClients: number
    totalClients: number
    monthlyEarnings: number
    todaySessions: number
  }
}

export function SectionCards({ data, stats }: SectionCardsProps) {
  const formattedEarnings = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(stats.monthlyEarnings)

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          {/* Clients.estatus Cliente: Activo */}
          <CardDescription>Pacientes Activos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeClients} {stats.activeClients === 1 ? 'Paciente' : 'Pacientes'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Fuerte retención de clientes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Basado en el estatus actual
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          {/* Sumatoria de Clients.precioSesiones */}
          <CardDescription>Ganancias del mes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formattedEarnings}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Ingresos de este mes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Ver detalle de pagos
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          {/* Clients.length */}
          <CardDescription>Total de Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalClients} {stats.totalClients === 1 ? 'Paciente' : 'Pacientes'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Crecimiento histórico <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Total registrados</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          {/* Sesiones para hoy */}
          <CardDescription>Sesiones para Hoy</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.todaySessions} {stats.todaySessions === 1 ? 'Sesión' : 'Sesiones'} Hoy
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUser />
              {stats.todaySessions}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Sesiones programadas <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Revisar agenda</div>
        </CardFooter>
      </Card>
    </div>
  )
}
