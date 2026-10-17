"use client";

import { useMemo } from "react";
import { Billboard, Text } from "@react-three/drei";
import type { Localizacao } from "@/types";
import { RUAS_ORDEM } from "@/data/seed/layout";
import { coordenadas3d } from "@/lib/heatmap";

export function AisleLabels({ localizacoes }: { localizacoes: Localizacao[] }) {
  const ruas = useMemo(() => {
    return RUAS_ORDEM.map((rua) => {
      const daRua = localizacoes.filter((l) => l.rua === rua);
      if (daRua.length === 0) return null;
      const [, , z] = coordenadas3d(daRua[0]);
      return { rua, z };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [localizacoes]);

  return (
    <>
      {ruas.map(({ rua, z }) => (
        <Billboard key={rua} position={[-1.8, 4.6, z]}>
          <Text fontSize={0.55} color="#d9b67f" anchorX="center" anchorY="middle">
            RUA {rua}
          </Text>
        </Billboard>
      ))}
    </>
  );
}
