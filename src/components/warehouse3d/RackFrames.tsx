"use client";

import { useMemo } from "react";
import type { Localizacao } from "@/types";
import { RUAS_ORDEM } from "@/data/seed/layout";
import { coordenadas3d } from "@/lib/heatmap";

const ALTURAS = ["00", "01", "02"] as const;
const PASSO_ALTURA = 1.4;
const COR_ESTRUTURA = "#3a4552";

// Estrutura decorativa das estantes (postes + vigas), derivada da mesma
// topologia real usada para posicionar os pallets — não é um grid genérico.
export function RackFrames({ localizacoes }: { localizacoes: Localizacao[] }) {
  const ruas = useMemo(() => {
    return RUAS_ORDEM.map((rua) => {
      const daRua = localizacoes.filter((l) => l.rua === rua);
      if (daRua.length === 0) return null;
      const maxPosicao = Math.max(...daRua.map((l) => Number(l.posicao)));
      const [, , z] = coordenadas3d(daRua[0]);
      const comprimento = (maxPosicao - 1) * 1.05;
      return { rua, z, comprimento, maxPosicao };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [localizacoes]);

  return (
    <group>
      {ruas.map(({ rua, z, comprimento }) => (
        <group key={rua}>
          {/* Postes nas duas extremidades da rua */}
          {[-0.55, comprimento + 0.55].map((x, idx) => (
            <mesh key={idx} position={[x, (ALTURAS.length * PASSO_ALTURA) / 2, z]} castShadow>
              <boxGeometry args={[0.08, ALTURAS.length * PASSO_ALTURA + 0.3, 0.08]} />
              <meshStandardMaterial color={COR_ESTRUTURA} />
            </mesh>
          ))}
          {/* Vigas horizontais em cada nível */}
          {ALTURAS.map((altura, i) => (
            <mesh key={altura} position={[comprimento / 2, i * PASSO_ALTURA, z]}>
              <boxGeometry args={[comprimento + 1.1, 0.06, 0.06]} />
              <meshStandardMaterial color={COR_ESTRUTURA} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
