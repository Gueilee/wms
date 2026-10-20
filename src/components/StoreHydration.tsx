"use client";

import { useEffect } from "react";
import { useWmsStore } from "@/store/useWmsStore";

const CHAVE_STORAGE = "braspel-wms-demo";

// O store usa `skipHydration` para evitar divergência entre o HTML renderizado
// no servidor (sempre com os dados de seed) e o estado persistido no
// navegador. Reidratamos manualmente aqui, já no cliente, um tick após o
// primeiro render.
//
// Também ouvimos o evento `storage`: ele dispara em TODAS as outras abas/
// janelas da mesma origem sempre que uma delas grava no localStorage — é
// assim que uma ação feita na aba de Recebimento aparece ao vivo na aba do
// Mapa 3D, sem precisar recarregar a página. Sem isso, cada aba fica com sua
// própria cópia do estado, congelada no momento em que foi aberta.
export function StoreHydration() {
  useEffect(() => {
    useWmsStore.persist.rehydrate();

    function aoMudarStorage(e: StorageEvent) {
      if (e.key === CHAVE_STORAGE) {
        useWmsStore.persist.rehydrate();
      }
    }

    window.addEventListener("storage", aoMudarStorage);
    return () => window.removeEventListener("storage", aoMudarStorage);
  }, []);

  return null;
}
