"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserCog, HardHat } from "lucide-react";
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
    <div className="h-dvh w-full overflow-hidden relative flex items-center lg:justify-end justify-center px-4">
      <Image
        src="/girou-login.png"
        alt="Girou WMS"
        fill
        priority
        className="object-cover object-[30%_center] lg:object-[38%_center]"
      />
      {/* Realça o card contra a foto do armazém sem esconder o logo à esquerda */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10 lg:to-black/20" />

      <div className="relative w-full max-w-sm lg:mr-12 xl:mr-20">
        <div className="w-full rounded-(--radius-lg) bg-white/95 backdrop-blur border border-black/5 p-7 flex flex-col items-center gap-6 shadow-2xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-(--radius-lg) bg-black px-5 py-4">
              <Image src="/nexys-logo.png" alt="Nexys" width={220} height={144} className="object-contain" />
            </div>
            <h1 className="font-display text-lg font-bold text-(--color-girou-ink)">Ambiente de demonstração</h1>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => entrar("gestor")}
              className="flex items-center gap-3 w-full rounded-(--radius-md) border border-black/10 bg-white px-4 py-3.5 text-left hover:border-(--color-girou-purple) transition-colors cursor-pointer"
            >
              <span
                className="flex items-center justify-center h-10 w-10 rounded-full text-white shrink-0"
                style={{ background: "var(--girou-purple)" }}
              >
                <UserCog size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-(--color-girou-ink)">Entrar como Gestor</span>
                <span className="block text-xs text-text-muted">Dashboard, KPIs, curva ABC e relatórios</span>
              </span>
            </button>

            <button
              onClick={() => entrar("operador")}
              className="flex items-center gap-3 w-full rounded-(--radius-md) border border-black/10 bg-white px-4 py-3.5 text-left hover:border-(--color-girou-green) transition-colors cursor-pointer"
            >
              <span
                className="flex items-center justify-center h-10 w-10 rounded-full text-white shrink-0"
                style={{ background: "var(--girou-green)" }}
              >
                <HardHat size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-(--color-girou-ink)">Entrar como Operador</span>
                <span className="block text-xs text-text-muted">Recebimento, separação, inventário com coletor</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
