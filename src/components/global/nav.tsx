import { Logo } from "@/components/global/logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Bell, Settings } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import React from "react";

export default function Nav() {
  const location = useLocation();
  const pathname = location.pathname;

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
        <ul className="flex  gap-5 items-center">
          <li>
            <Link to="/settings">
              <Settings />
            </Link>
          </li>
          <li>
            <Link to="/activities">
              <Bell />
            </Link>
          </li>
          <li>
            <Avatar>
              <AvatarImage src="/img/avatar.png" alt="user" />
              <AvatarFallback>HP</AvatarFallback>
            </Avatar>
          </li>
        </ul>
      </nav>
    </div>
  );
}
