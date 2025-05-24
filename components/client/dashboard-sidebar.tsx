"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  Contact2,
  FileText,
  Home,
  HomeIcon,
  Phone,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Accueil",
      href: "/client/dashboard",
      icon: HomeIcon,
    },
    {
      title: "Mes documents et informations",
      href: "/client/documents",
      icon: FileText,
    },
    {
      title: "Mes rendez-vous",
      href: "/client/rendez-vous",
      icon: CalendarClock,
    },
    {
      title: "Nous contacter",
      href: "/client/contact",
      icon: Phone,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="text-xl font-bold">Dashboard</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dubai Launchers
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
