import { useDrop } from 'react-dnd'
import { useDNAStore } from './dnaStore'
import type { Gene, Organ, NeuralLink } from './dnaStore'

export function CreatureCanvas({ setSelectedItem }: { setSelectedItem: (item: any) => void }) {
  const { dna } = useDNAStore()
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['gene', 'organ', 'neural_link'],
    drop: () => {}, // No-op, handled by Toolbox
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  return (
    <div
      ref={node => { if (node) drop(node) }}
      className={`flex-1 min-h-[300px] bg-slate-700 rounded-lg p-4 transition-colors ${isOver && canDrop ? 'bg-green-700' : ''}`}
    >
      <h2 className="text-lg font-semibold mb-4">Creature Canvas</h2>
      {dna.genes.length + Object.keys(dna.organs).length + dna.neural_links.length === 0 ? (
        <div className="text-slate-400">Drag genes, organs, or neural links here</div>
      ) : (
        <ul className="space-y-2">
          {dna.genes.map((gene: Gene, idx: number) => (
            <li key={`gene-${idx}`} className="bg-slate-800 rounded p-2 shadow text-white cursor-pointer" onClick={() => setSelectedItem({ type: 'gene', index: idx })}>
              {gene.name} Gene (value: {gene.value})
            </li>
          ))}
          {Object.entries(dna.organs).map(([name, organ], idx) => (
            <li key={`organ-${name}`} className="bg-slate-800 rounded p-2 shadow text-white cursor-pointer" onClick={() => setSelectedItem({ type: 'organ', name })}>
              {name.charAt(0).toUpperCase() + name.slice(1)} Organ {JSON.stringify(organ as Organ)}
            </li>
          ))}
          {dna.neural_links.map((link: NeuralLink, idx: number) => (
            <li key={`neural-${idx}`} className="bg-slate-800 rounded p-2 shadow text-white cursor-pointer" onClick={() => setSelectedItem({ type: 'neural', index: idx })}>
              Neural Link: {link.input}→{link.output} (weight: {link.weight})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 