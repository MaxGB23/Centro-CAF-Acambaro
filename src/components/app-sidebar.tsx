"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconHome,
  IconCalendar,
  IconMail,
  IconCarambolaFilled,
  IconBolt,
  IconPlayerPlay,
} from "@tabler/icons-react"

import { Home, HomeIcon, User } from "lucide-react";


import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { authClient } from "@/lib/auth-client"
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { data: session } = authClient.useSession()

  const navData = {
    user: {
      name: session?.user?.name || "Usuario CAF",
      email: session?.user?.position != "Otro" ? session?.user?.position : session?.user?.email || "No identificado",
      avatar: "/images/scfn.jpg",
    },
    navMain: [
      {
        title: "Inicio",
        url: "/dashboard",
        icon: HomeIcon,
      },
      // {
      //   title: "CAF",
      //   url: "/",
      //   icon: IconPlayerPlay,
      // },
      {
        title: "Analíticas (Próximamente)",
        url: "#",
        icon: IconChartBar,
      },
      // {
      //   title: "Calendario",
      //   url: "#",
      //   icon: IconCalendar,
      // },
      {
        title: "Empleados",
        url: "/dashboard/registro",
        icon: IconUsers,
      },

    ],
    navClouds: [
      {
        title: "Capture",
        icon: IconCamera,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Proposal",
        icon: IconFileDescription,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Prompts",
        icon: IconFileAi,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Configuración",
        url: "#",
        icon: IconSettings,
      },
      {
        title: "Ayuda",
        url: "#",
        icon: IconHelp,
      },
      {
        title: "Buscar",
        url: "#",
        icon: IconSearch,
      },
    ],
    documents: [
      {
        name: "Base de Datos",
        url: "#",
        icon: IconDatabase,
      },
      {
        name: "Reportes",
        url: "#",
        icon: IconReport,
      },
      {
        name: "Asistente de IA",
        url: "#",
        icon: IconFileWord,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <IconCarambolaFilled className="size-5!" />
                <span className="text-base font-semibold">Centro CAF Acámbaro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavDocuments items={navData.documents} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
