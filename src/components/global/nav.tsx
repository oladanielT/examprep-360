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
import { Settings, LogOut, User, Menu, X, CreditCard, Gift, Wallet } from "lucide-react";
import NotificationBell from "@/components/global/notification-bell";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/feature/auth/hooks";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { useState } from "react";

export default function Nav() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useProfile();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { url: "/", title: "home" },
    { url: "/textbooks", title: "Textbooks" },
    { url: "/tests", title: "Tests" },
    { url: "/tutorials", title: "Tutorials" },
    { url: "/activities", title: "Activities" },
    { url: "/leaderboard", title: "Leaderboard" },
    { url: "/subscription", title: "Subscription" },
  ];

  return (
    <div className="bg-warning">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
        <div className="flex gap-5 items-center">
          <Logo />
          {/* Desktop nav links */}
          <ul className="hidden lg:flex gap-3 xl:gap-5 items-center">
            {navLinks.map((link) => {
              const isActive =
                link.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.url);

              return (
                <Link
                  className={cn(
                    "capitalize p-3 font-semibold transition-all duration-300 ease-in-out rounded-md text-sm xl:text-base",
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

        {/* Desktop right actions */}
        <ul className="hidden lg:flex gap-5 items-center">
          <li>
            <NotificationBell />
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
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/subscription" })}
                  className="cursor-pointer"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/referral" })}
                  className="cursor-pointer"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Referral Program
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/wallet" })}
                  className="cursor-pointer"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
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

        {/* Mobile: right actions + hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          <NotificationBell className="w-5 h-5" />
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profilePictureUrl || "/img/avatar.png"} alt="user" />
                <AvatarFallback className="text-xs">{getInitials(user?.fullName)}</AvatarFallback>
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
              <DropdownMenuItem
                onClick={() => navigate({ to: "/subscription" })}
                className="cursor-pointer"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: "/referral" })}
                className="cursor-pointer"
              >
                <Gift className="mr-2 h-4 w-4" />
                Referral Program
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: "/wallet" })}
                className="cursor-pointer"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: "/settings" })}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md hover:bg-black/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/50 transition-opacity lg:hidden",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[100] w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-semibold text-lg">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ul className="flex flex-col gap-1 p-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive =
              link.url === "/"
                ? pathname === "/"
                : pathname.startsWith(link.url);

            return (
              <Link
                className={cn(
                  "capitalize p-3 font-semibold transition-all duration-200 rounded-md",
                  isActive
                    ? "text-white bg-primary shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                to={link.url}
                key={link.title}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.title}
              </Link>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
