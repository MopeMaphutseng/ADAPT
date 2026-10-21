"use client";

import { useEffect, useState } from "react";
import { SearchPalette, SearchTriggerButton } from "@/components/search/SearchPalette";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <SearchTriggerButton onOpen={() => setOpen(true)} />
      <SearchPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
