"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

type StartupMobileButtonProps = {
  href: string;
  label?: string;
  sublabel?: string;
  className?: string;
};

export default function StartupMobileButton({
  href,
  label = "Publicar agora",
  sublabel = "Rápido, moderno e profissional",
  className = "",
}: StartupMobileButtonProps) {
  return (
    <div
      className={`fixed bottom-4 left-1/2 z-50 w-[calc(100%-20px)] max-w-sm -translate-x-1/2 md:hidden ${className}`}
    >
      <Link
        href={href}
        className="
          group relative flex items-center justify-between gap-3
          overflow-hidden rounded-[26px]
          border border-white/20
          bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400
          px-4 py-4 text-white
          shadow-[0_18px_45px_rgba(16,185,129,0.35)]
          transition-all duration-300
          active:scale-[0.98]
        "
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex min-w-0 items-center gap-3">
          <div
            className="
              flex h-12 w-12 shrink-0 items-center justify-center
              rounded-2xl bg-white/20 backdrop-blur-md
              ring-1 ring-white/25
            "
          >
            <Plus className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">
              {label}
            </p>
            <p className="truncate text-[12px] text-white/90">
              {sublabel}
            </p>
          </div>
        </div>

        <div
          className="
            relative shrink-0 rounded-full
            bg-white/20 px-3 py-1.5
            text-[11px] font-semibold uppercase tracking-wide
            backdrop-blur-sm ring-1 ring-white/20
          "
        >
          abrir
        </div>
      </Link>
    </div>
  );
}