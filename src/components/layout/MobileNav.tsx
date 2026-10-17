"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

export function MobileNav() {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex items-center justify-center h-9 w-9 rounded-(--radius-md) border border-border cursor-pointer"
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAberto(false)} />
          <div className="relative w-72 max-w-[80vw] bg-bg-elevated h-full flex flex-col border-r border-border">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <div className="flex items-center gap-2">
                <Image src="/braspel-logo.png" alt="Braspel" width={28} height={28} />
                <span className="font-display font-bold text-sm">Braspel</span>
              </div>
              <button onClick={() => setAberto(false)} className="h-8 w-8 flex items-center justify-center cursor-pointer" aria-label="Fechar menu">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const ativo = pathname === href || pathname?.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setAberto(false)}
                    className={clsx(
                      "flex items-center gap-3 rounded-(--radius-md) px-3 py-3 text-sm font-medium",
                      ativo ? "bg-brand-green-700 text-white" : "text-text-muted hover:bg-surface-muted"
                    )}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
