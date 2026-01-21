"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSearch } from "@/lib/url-state";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
}

export function SearchInput({
  placeholder = "Search...",
  className,
  showClearButton = true,
}: SearchInputProps) {
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value || null);
  };

  const handleClear = () => {
    clearSearch();
  };

  return (
    <InputGroup className={cn(className)}>
      <InputGroupInput
        value={searchQuery || ""}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <InputGroupAddon>
        {searchQuery && showClearButton ? (
          <button
            onClick={handleClear}
            className="hover:text-muted-foreground transition-colors"
            aria-label="Clear search"
          >
            <XIcon className="size-4" />
          </button>
        ) : (
          <SearchIcon className="size-4" />
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
