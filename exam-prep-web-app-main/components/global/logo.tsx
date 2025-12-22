import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Logo = () => {
  return (
    <Link href="#" className="flex items-center gap-2 font-medium">
      <Image src="/logo-white.svg" alt="Image" width={104} height={60} />
    </Link>
  );
};
