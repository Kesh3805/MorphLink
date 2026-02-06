import { useDrag } from 'react-dnd'
import { useDNAStore } from './dnaStore'

const ITEMS = [
  { type: 'gene', name: 'Speed', value: 1.0 },
  { type: 'gene', name: 'Aggression', value: 1.0 },
  { type: 'organ', name: 'heart', organ: { efficiency: 1.0 } },
  { type: 'organ', name: 'brain', organ: { neuron_count: 100 } },
  { type: 'neural_link', input: 'light', output: 'move', weight: 0.5 },
  { type: 'neural_link', input: 'pain', output: 'scream', weight: -0.3 },
]

function ToolboxItem({ item }: { item: any }) {
  const { addGene, addOrgan, addNeuralLink } = useDNAStore()
  const [{ isDragging }, drag] = useDrag(() => ({
    type: item.type,
    item,
    end: (draggedItem, monitor) => {
      if (monitor.didDrop()) {
        if (item.type === 'gene') addGene({ name: item.name, value: item.value })
        else if (item.type === 'organ') addOrgan(item.name, item.organ)
        else if (item.type === 'neural_link') addNeuralLink({ input: item.input, output: item.output, weight: item.weight })
      }
    },
    collect: (monitor: any) => ({ isDragging: monitor.isDragging() }),
  }))
  return (
    <div
      ref={node => { if (node) drag(node) }}
      className={`p-2 m-2 rounded cursor-move bg-slate-700 hover:bg-slate-600 text-white shadow ${isDragging ? 'opacity-50' : ''}`}
    >
      {item.type === 'gene' && `${item.name} Gene`}
      {item.type === 'organ' && `${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`}
      {item.type === 'neural_link' && `Neural Link: ${item.input}→${item.output}`}
    </div>
  )
}

export function Toolbox() {
  return (
    <div className="w-48 bg-slate-900 rounded-lg p-4 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4">Toolbox</h2>
      {ITEMS.map((item, idx) => (
        <ToolboxItem key={idx} item={item} />
      ))}
    </div>
  )
} 