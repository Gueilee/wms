"use client";

import { useEffect } from "react";
import { useWmsStore } from "@/store/useWmsStore";

// O store usa `skipHydration` para evitar divergência entre o HTML renderizado
// no servidor (sempre com os dados de seed) e o estado persistido no
// navegador. Reidratamos manualmente aqui, já no cliente, um tick após o
// primeiro render.
export function StoreHydration() {
  useEffect(() => {
    useWmsStore.persist.rehydrate();
  }, []);

  return null;
}
