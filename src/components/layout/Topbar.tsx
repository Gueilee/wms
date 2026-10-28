"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, RotateCcw, UserCog, Warehouse } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import { useAlertasAtivos } from "@/lib/selectors";
import { MobileNav } from "./MobileNav";

export function Topbar() {
  const [confirmando, setConfirmando] = useState(false);
  const { itens, lotes, pedidos, contagens, localizacoes, alertasIgnorados, perfil, definirPerfil, resetDemo } =
    useWmsStore();
  const alertas = useAlertasAtivos(itens, lotes, pedidos, contagens, localizacoes, alertasIgnorados);
  const criticos = alertas.filter((a) => a.severidade === "critico").length;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-bg-elevated/90 backdrop-blur flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <MobileNav />
        <div className="flex items-center gap-2">
          <Warehouse size={20} className="text-brand-bronze-500" />
          <span className="font-display font-bold text-sm">Girou</span>
        </div>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => definirPerfil(perfil === "gestor" ? "operador" : "gestor")}
          className="flex items-center gap-2 rounded-(--radius-md) border border-border px-3 py-2 text-xs font-semibold text-text-muted hover:bg-surface-muted transition-colors cursor-pointer"
          title="Alternar perfil de visualização"
        >
          <UserCog size={16} />
          {perfil === "gestor" ? "Gestor" : "Operador de armazém"}
        </button>

        <Link
          href="/alertas"
          className="relative flex items-center justify-center h-9 w-9 rounded-(--radius-md) border border-border hover:bg-surface-muted transition-colors cursor-pointer"
          aria-label="Ver alertas"
        >
          <Bell size={17} />
          {alertas.length > 0 && (
            <span
              className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white px-1 ${
                criticos > 0 ? "bg-status-critical" : "bg-status-blocked"
              }`}
            >
              {alertas.length}
            </span>
          )}
        </Link>

        {confirmando ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-text-muted hidden sm:inline">Restaurar dados de demo?</span>
            <button
              onClick={() => {
                resetDemo();
                setConfirmando(false);
              }}
              className="rounded-(--radius-md) bg-status-critical text-white px-2.5 py-2 font-semibold cursor-pointer"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirmando(false)}
              className="rounded-(--radius-md) border border-border px-2.5 py-2 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="flex items-center gap-2 rounded-(--radius-md) border border-border px-3 py-2 text-xs font-semibold text-text-muted hover:bg-surface-muted transition-colors cursor-pointer"
            title="Restaura o cenário original da demonstração"
          >
            <RotateCcw size={15} />
            <span className="hidden sm:inline">Resetar demonstração</span>
          </button>
        )}
      </div>
    </header>
  );
}
