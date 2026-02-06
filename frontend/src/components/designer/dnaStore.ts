import { create } from 'zustand'
import type { StateCreator } from 'zustand'

export type Gene = { name: string; value: number }
export type Organ = { efficiency: number; neuron_count?: number }
export type NeuralLink = { input: string; output: string; weight: number }

export type DNA = {
  genes: Gene[]
  organs: Record<string, Organ>
  neural_links: NeuralLink[]
}

export type SelectedItem =
  | { type: 'gene'; index: number }
  | { type: 'organ'; name: string }
  | { type: 'neural'; index: number }
  | null

interface DNAStore {
  dna: DNA
  selectedItem: SelectedItem
  setSelectedItem: (item: SelectedItem) => void
  setDNA: (dna: DNA) => void
  updateGene: (index: number, value: number) => void
  updateOrgan: (name: string, prop: string, value: number) => void
  updateNeural: (index: number, prop: string, value: any) => void
  addGene: (gene: Gene) => void
  addOrgan: (name: string, organ: Organ) => void
  addNeuralLink: (link: NeuralLink) => void
  // Undo/redo
  history: DNA[]
  future: DNA[]
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

export const useDNAStore = create<DNAStore>((set: any, get: any) => ({
  dna: { genes: [], organs: {}, neural_links: [] },
  selectedItem: null,
  history: [],
  future: [],
  setSelectedItem: (item: SelectedItem) => set({ selectedItem: item }),
  pushHistory: () => {
    const { dna, history } = get()
    set({ history: [...history, JSON.parse(JSON.stringify(dna))], future: [] })
  },
  undo: () => {
    const { history, dna, future } = get()
    if (history.length === 0) return
    const prev = history[history.length - 1]
    set({
      dna: prev,
      history: history.slice(0, -1),
      future: [JSON.parse(JSON.stringify(dna)), ...future],
      selectedItem: null,
    })
  },
  redo: () => {
    const { history, dna, future } = get()
    if (future.length === 0) return
    const next = future[0]
    set({
      dna: next,
      history: [...history, JSON.parse(JSON.stringify(dna))],
      future: future.slice(1),
      selectedItem: null,
    })
  },
  setDNA: (dna: DNA) => {
    get().pushHistory()
    set({ dna })
  },
  updateGene: (index: number, value: number) => {
    get().pushHistory()
    set((state: DNAStore) => {
      const genes = [...state.dna.genes]
      genes[index].value = value
      return { dna: { ...state.dna, genes } }
    })
  },
  updateOrgan: (name: string, prop: string, value: number) => {
    get().pushHistory()
    set((state: DNAStore) => ({
      dna: {
        ...state.dna,
        organs: {
          ...state.dna.organs,
          [name]: { ...state.dna.organs[name], [prop]: value },
        },
      },
    }))
  },
  updateNeural: (index: number, prop: string, value: any) => {
    get().pushHistory()
    set((state: DNAStore) => {
      const neural_links = [...state.dna.neural_links]
      neural_links[index] = { ...neural_links[index], [prop]: value }
      return { dna: { ...state.dna, neural_links } }
    })
  },
  addGene: (gene: Gene) => {
    get().pushHistory()
    set((state: DNAStore) => ({
      dna: { ...state.dna, genes: [...state.dna.genes, gene] },
    }))
  },
  addOrgan: (name: string, organ: Organ) => {
    get().pushHistory()
    set((state: DNAStore) => ({
      dna: {
        ...state.dna,
        organs: { ...state.dna.organs, [name]: organ },
      },
    }))
  },
  addNeuralLink: (link: NeuralLink) => {
    get().pushHistory()
    set((state: DNAStore) => {
      let neural_links = [...state.dna.neural_links, link];
      // Ensure all movement outputs are present
      const movementOutputs = ["move_up", "move_down", "move_left", "move_right"];
      for (const output of movementOutputs) {
        if (!neural_links.some(l => l.output === output)) {
          neural_links.push({ input: "light", output, weight: 0.5 });
        }
      }
      return {
        dna: { ...state.dna, neural_links },
      };
    })
  },
})) 