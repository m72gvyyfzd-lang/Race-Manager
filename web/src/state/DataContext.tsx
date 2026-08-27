import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Boot, Regatta, Start, Zeiteintrag } from "@race-manager/core";
import { ladeState, speichereState, type AppState } from "./storage";

interface DataApi {
  regatten: Regatta[];
  aktiveRegatta: Regatta | null;
  setAktiveRegattaId: (id: string | null) => void;
  neueRegatta: (regatta: Regatta) => void;
  /** Import: ersetzt eine vorhandene Regatta mit gleicher id, sonst neu */
  importiereRegatta: (regatta: Regatta) => void;
  loescheRegatta: (id: string) => void;
  updateRegatta: (id: string, patch: Partial<Regatta>) => void;
  addBoot: () => void;
  updateBoot: (bootId: string, patch: Partial<Boot>) => void;
  removeBoot: (bootId: string) => void;
  addStart: () => void;
  updateStart: (startId: string, patch: Partial<Start>) => void;
  removeStart: (startId: string) => void;
  setZeit: (startId: string, bootId: string, patch: Partial<Omit<Zeiteintrag, "startId" | "bootId">>) => void;
}

const DataContext = createContext<DataApi | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(ladeState);

  useEffect(() => {
    speichereState(state);
  }, [state]);

  const patchRegatta = (id: string, fn: (r: Regatta) => Regatta) =>
    setState((s) => ({
      ...s,
      regatten: s.regatten.map((r) => (r.id === id ? fn(r) : r)),
    }));

  const patchAktive = (fn: (r: Regatta) => Regatta) =>
    setState((s) =>
      s.aktiveRegattaId
        ? { ...s, regatten: s.regatten.map((r) => (r.id === s.aktiveRegattaId ? fn(r) : r)) }
        : s,
    );

  const api: DataApi = {
    regatten: state.regatten,
    aktiveRegatta: state.regatten.find((r) => r.id === state.aktiveRegattaId) ?? null,

    setAktiveRegattaId: (id) => setState((s) => ({ ...s, aktiveRegattaId: id })),

    neueRegatta: (regatta) =>
      setState((s) => ({
        regatten: [...s.regatten, regatta],
        aktiveRegattaId: regatta.id,
      })),

    importiereRegatta: (regatta) =>
      setState((s) => ({
        regatten: s.regatten.some((r) => r.id === regatta.id)
          ? s.regatten.map((r) => (r.id === regatta.id ? regatta : r))
          : [...s.regatten, regatta],
        aktiveRegattaId: regatta.id,
      })),

    loescheRegatta: (id) =>
      setState((s) => ({
        regatten: s.regatten.filter((r) => r.id !== id),
        aktiveRegattaId: s.aktiveRegattaId === id ? null : s.aktiveRegattaId,
      })),

    updateRegatta: (id, patch) => patchRegatta(id, (r) => ({ ...r, ...patch })),

    addBoot: () =>
      patchAktive((r) => ({
        ...r,
        boote: [
          ...r.boote,
          {
            id: crypto.randomUUID(),
            name: "",
            skipper: "",
            crew: "",
            verein: "",
            bootstyp: "",
            yardstick: 100,
            meldungErhalten: false,
            meldegeldBezahlt: false,
            anzahlEssen: 0,
            essenBezahlt: false,
          },
        ],
      })),

    updateBoot: (bootId, patch) =>
      patchAktive((r) => ({
        ...r,
        boote: r.boote.map((b) => (b.id === bootId ? { ...b, ...patch } : b)),
      })),

    removeBoot: (bootId) =>
      patchAktive((r) => ({
        ...r,
        boote: r.boote.filter((b) => b.id !== bootId),
        zeiten: r.zeiten.filter((z) => z.bootId !== bootId),
      })),

    addStart: () =>
      patchAktive((r) => {
        const nummer = Math.max(0, ...r.starts.map((s) => s.nummer)) + 1;
        return {
          ...r,
          starts: [
            ...r.starts,
            { id: crypto.randomUUID(), nummer, bezeichnung: `${nummer}. Start`, aktiv: true },
          ],
        };
      }),

    updateStart: (startId, patch) =>
      patchAktive((r) => ({
        ...r,
        starts: r.starts.map((s) => (s.id === startId ? { ...s, ...patch } : s)),
      })),

    removeStart: (startId) =>
      patchAktive((r) => ({
        ...r,
        starts: r.starts.filter((s) => s.id !== startId),
        zeiten: r.zeiten.filter((z) => z.startId !== startId),
      })),

    setZeit: (startId, bootId, patch) =>
      patchAktive((r) => {
        const bisher = r.zeiten.find((z) => z.startId === startId && z.bootId === bootId);
        const neu: Zeiteintrag = { startId, bootId, ...bisher, ...patch };
        const rest = r.zeiten.filter((z) => !(z.startId === startId && z.bootId === bootId));
        const leer = neu.startzeit === undefined && neu.zielzeit === undefined && !neu.status;
        return { ...r, zeiten: leer ? rest : [...rest, neu] };
      }),
  };

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
}

export function useData(): DataApi {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData außerhalb des DataProviders");
  return ctx;
}
