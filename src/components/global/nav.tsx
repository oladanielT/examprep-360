import { Logo } from "@/components/global/logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/feature/auth/hooks";
import { useProfile } from "@/feature/profile/hooks/useProfile";

export default function Nav() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useProfile();
  const logoutMutation = useLogout();

  // Hide nav during exam (focused exam experience)
  if (pathname.startsWith('/exam/')) {
    return null;
  }

  // Use profile data if available, fallback to auth store
  const user = profileUser || authUser;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate({ to: "/sign-in" });
  };

  // Get user initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    {
      url: "/",
      title: "home",
    },
    {
      url: "/textbooks",
      title: "Textbooks",
    },
    {
      url: "/tests",
      title: "Tests",
    },
    {
      url: "/tutorials",
      title: "Tutorials",
    },
    {
      url: "/activities",
      title: "Activities",
    },
    {
      url: "/leaderboard",
      title: "Leaderboard",
    },
  ];

  return (
    <div className="bg-warning">
      <nav className="max-w-6xl mx-auto flex items-center justify-between  py-5">
        <div className="flex  gap-5 items-center">
          <Logo />
          <ul className="flex  gap-5 items-center">
            {navLinks.map((link) => {
              const isActive =
                link.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.url);

              return (
                <Link
                  className={cn(
                    "capitalize p-3 font-semibold transition-all duration-300 ease-in-out rounded-md",
                    isActive
                      ? "text-white bg-primary shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  to={link.url}
                  key={link.title}
                >
                  {link.title}
                </Link>
              );
            })}
          </ul>
        </div>
        <ul className="flex gap-5 items-center">
          <li>
            <Bell className="cursor-pointer" />
          </li>
          <li>
            <Link to="/settings">
              <Settings />
            </Link>
          </li>
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
              >
                <Avatar>
                  <AvatarImage src={user?.profilePictureUrl || "/img/avatar.png"} alt="user" />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.fullName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/settings" })}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
      </nav>
    </div>
  );
}
