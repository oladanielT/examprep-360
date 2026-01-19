import { Link } from "@tanstack/react-router";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 font-medium">
      <img src="/logo-white.svg" alt="Logo" width={104} height={60} />
    </Link>
  );
};
