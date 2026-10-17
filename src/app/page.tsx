"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Warehouse, UserCog, HardHat } from "lucide-react";
import { useWmsStore } from "@/store/useWmsStore";
import type { PerfilUsuario } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const definirPerfil = useWmsStore((s) => s.definirPerfil);

  function entrar(perfil: PerfilUsuario) {
    definirPerfil(perfil);
    router.push(perfil === "gestor" ? "/dashboard" : "/recebimento");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-green-900 px-4">
      <div className="w-full max-w-md rounded-(--radius-lg) bg-surface border border-border p-8 flex flex-col items-center gap-6 shadow-2xl">
        <Image src="/braspel-logo.png" alt="Braspel" width={96} height={96} className="object-contain" />

        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-text">Braspel WMS</h1>
          <p className="text-sm text-text-muted mt-1">
            Sistema de gestão de armazém — ambiente de demonstração
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => entrar("gestor")}
            className="flex items-center gap-3 w-full rounded-(--radius-md) border border-border bg-bg-elevated px-4 py-3.5 text-left hover:border-brand-bronze-500 transition-colors cursor-pointer"
          >
            <span className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-green-700 text-white shrink-0">
              <UserCog size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-text">Entrar como Gestor</span>
              <span className="block text-xs text-text-muted">Dashboard, KPIs, curva ABC e relatórios</span>
            </span>
          </button>

          <button
            onClick={() => entrar("operador")}
            className="flex items-center gap-3 w-full rounded-(--radius-md) border border-border bg-bg-elevated px-4 py-3.5 text-left hover:border-brand-bronze-500 transition-colors cursor-pointer"
          >
            <span className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-bronze-600 text-white shrink-0">
              <HardHat size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-text">Entrar como Operador</span>
              <span className="block text-xs text-text-muted">Recebimento, separação, inventário com coletor</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-text-faint mt-2">
          <Warehouse size={13} />
          Dados fictícios para fins de demonstração comercial
        </div>
      </div>
    </div>
  );
}
