"use client";

import { Delete } from "lucide-react";

export function NumericKeypad({ onDigit, onBackspace }: { onDigit: (d: string) => void; onBackspace: () => void }) {
  const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {teclas.map((t, i) =>
        t === "" ? (
          <div key={i} />
        ) : t === "back" ? (
          <button
            key={i}
            onClick={onBackspace}
            className="h-11 rounded-md bg-white/10 text-white flex items-center justify-center active:bg-white/20 cursor-pointer"
          >
            <Delete size={16} />
          </button>
        ) : (
          <button
            key={i}
            onClick={() => onDigit(t)}
            className="h-11 rounded-md bg-white/10 text-white text-lg font-semibold active:bg-white/20 cursor-pointer"
          >
            {t}
          </button>
        )
      )}
    </div>
  );
}
