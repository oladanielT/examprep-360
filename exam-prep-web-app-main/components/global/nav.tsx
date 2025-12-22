"use client";
import { Logo } from "@/components/global/logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Bell, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { paths } from "@/paths";

export default function Nav() {
  const pathname = usePathname();

  const navLinks = [
    {
      url: paths.app.root.getHref(),
      title: "home",
    },
    {
      url: paths.app.textbooks.getHref(),
      title: "Textbooks",
    },
    {
      url: paths.app.tests.getHref(),
      title: "Tests",
    },
    {
      url: paths.app.tutorials.getHref(),
      title: "Tutorials",
    },
    {
      url: paths.app.leaderboard.getHref(),
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
                  href={link.url}
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
            <Link href={paths.app.settings.getHref()}>
              <Settings />
            </Link>
          </li>
          <li>
            <Link href={paths.app.activities.getHref()}>
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
