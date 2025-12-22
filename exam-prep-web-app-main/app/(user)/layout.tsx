import Nav from "@/components/global/nav";
import React, { ReactNode } from "react";
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-white min-h-screen font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto ">{children}</div>
    </div>
  );
}
