"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ColetorFrame } from "@/components/coletor/ColetorFrame";
import { ColetorApp } from "@/components/coletor/ColetorApp";

export default function ColetorPage() {
  return (
    <div className="min-h-dvh w-full bg-[#1b231f] flex flex-col">
      <div className="flex items-center justify-between px-5 h-14 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/70 text-sm font-medium hover:text-white transition-colors">
          <ArrowLeft size={16} /> Sair do simulador
        </Link>
        <span className="text-white/40 text-xs">Simulador de coletor — Girou WMS</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8 min-h-0">
        <div className="h-[82dvh] max-h-[850px]">
          <ColetorFrame>
            <ColetorApp />
          </ColetorFrame>
        </div>
      </div>
    </div>
  );
}
