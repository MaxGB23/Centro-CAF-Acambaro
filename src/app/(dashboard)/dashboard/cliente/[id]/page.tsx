import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ClientDetailView } from "@/components/client-detail-view"
import {
  getClientDetail,
  getClientPackages,
  getClientPayments,
  getClientSessions
} from "@/server/queries/client-detail"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  const [client, packages, payments, sessions] = await Promise.all([
    getClientDetail(id),
    getClientPackages(id),
    getClientPayments(id),
    getClientSessions(id),
  ])

  if (!client) {
    notFound()
  }

  return (
    <ClientDetailView
      client={client}
      packages={packages}
      payments={payments}
      sessions={sessions}
    />
  )
}
