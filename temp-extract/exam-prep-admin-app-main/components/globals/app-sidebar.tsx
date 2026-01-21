"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  BarChart2,
  BookOpen,
  ClipboardCheck,
  Clock,
  LayoutList,
  DollarSign,
  HelpCircle,
  FileText,
  Ticket,
  Bell,
  Settings,
  LogOut,
  ImageIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { paths } from "@/config/paths";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdmin, useLogout } from "@/lib/auth";
import { MediaUploadDialog } from "@/features/media/components/media-upload-dialog";

// ========== NAVIGATION ITEMS ==========
const navItems = [
  {
    title: "Home",
    url: paths.app.dashboard.getHref(),
    icon: Home,
  },
  {
    title: "Users",
    url: paths.app.users.getHref(),
    icon: Users,
  },
  {
    title: "Exams",
    url: paths.app.exams.getHref(),
    icon: BarChart2,
  },
  {
    title: "Subjects",
    url: paths.app.subjects.getHref(),
    icon: BookOpen,
  },
  {
    title: "O' Level Tutorials",
    url: paths.app.tutorials.getHref(),
    icon: ClipboardCheck,
  },
  {
    title: "Higher Institutions",
    url: paths.app.institutions.getHref(),
    icon: Clock,
  },
  {
    title: "Courses",
    url: paths.app.courses.getHref(),
    icon: LayoutList,
  },
  {
    title: "Sales",
    url: paths.app.sales.getHref(),
    icon: DollarSign,
  },
  {
    title: "Questions",
    url: paths.app.questions.getHref(),
    icon: HelpCircle,
  },
  {
    title: "Big Mock",
    url: paths.app.mock.getHref(),
    icon: FileText,
  },
  {
    title: "Tickets",
    url: paths.app.tickets.getHref(),
    icon: Ticket,
  },
  {
    title: "Notifications",
    url: paths.app.notifications.getHref(),
    icon: Bell,
  },
];

const navSecondary = [
  {
    title: "Settings",
    url: paths.app.settings.getHref(),
    icon: Settings,
  },
];

function isRouteActive(pathname: string, url: string): boolean {
  if (url === "/" || url === paths.app.dashboard.getHref()) {
    return pathname === "/" || pathname === paths.app.dashboard.getHref();
  }
  return pathname.startsWith(url);
}

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = React.useState(false);

  const logoutMutation = useLogout({
    onSuccess: () => {
      router.push(paths.auth.signIn.getHref(pathname));
    },
    onError: (error) => {
      console.error("Logout error:", error);
      router.push(paths.auth.signIn.getHref(pathname));
    },
  });

  const handleLogout = () => {
    setIsOpen(false);
    logoutMutation.mutate();
  };

  const { data: admin, isLoading } = useAdmin();

  const initials =
    admin?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "CN";

  return (
    <Sidebar {...props} className="border-none">
      <SidebarHeader className="flex flex-row items-center gap-2 p-4 py-10">
        <div className="h-6 w-6 rounded-full bg-purple-600/50 p-1">
          <div className="h-full w-full rounded-full bg-white opacity-40" />
        </div>
        <span className="text-xl font-bold">Exam Prep</span>
      </SidebarHeader>

      <SidebarContent className="px-5 text-lg font-semibold">
        <SidebarMenu>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isRouteActive(pathname, item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="flex items-center gap-3"
                >
                  <Link href={item.url}>
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarMenu className="mt-auto">
          {/* Media Manager */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setMediaDialogOpen(true)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <ImageIcon className="h-5 w-5" />
              Media Manager
            </SidebarMenuButton>
          </SidebarMenuItem>

          {navSecondary.map((item) => {
            const IconComponent = item.icon;
            const active = isRouteActive(pathname, item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="flex items-center gap-3"
                >
                  <Link href={item.url}>
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarMenu className="border-t border-[#475467] py-5 flex flex-row items-center">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg text-gray-800">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-left text-sm leading-tight">
            {isLoading ? (
              <>
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-1" />
                <div className="h-3 w-32 bg-gray-300 rounded animate-pulse" />
              </>
            ) : (
              <>
                <p className="truncate font-medium">
                  {admin?.fullName || "Admin User"}
                </p>
                <span className="truncate text-xs">
                  {admin?.email || "admin@example.com"}
                </span>
              </>
            )}
          </div>

          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <button
                className="text-[#98A2B3] hover:text-rose-500 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogTitle>Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You will need to sign in again
                to access your account.
              </AlertDialogDescription>

              <div className="flex justify-end gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarMenu>
      </SidebarContent>

      <SidebarRail />

      {/* Media Upload Dialog */}
      <MediaUploadDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
      />
    </Sidebar>
  );
}
