"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "./navItems";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 shrink-0 flex-col border-r border-border bg-bg-elevated h-screen sticky top-0">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
        <Image src="/braspel-logo.png" alt="Braspel" width={32} height={32} className="object-contain" />
        <div className="leading-tight">
          <p className="font-display font-bold text-sm text-text">Braspel</p>
          <p className="text-[11px] text-text-faint">Workspace de demonstração</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-(--radius-md) px-3 py-2.5 text-sm font-medium transition-colors",
                ativo
                  ? "bg-brand-green-700 text-white"
                  : "text-text-muted hover:bg-surface-muted hover:text-text"
              )}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t border-border text-[10px] text-text-faint flex items-center gap-1.5">
        Powered by
        <span className="font-display font-bold" style={{ color: "var(--girou-purple)" }}>
          GIROU
        </span>
      </div>
    </aside>
  );
}
