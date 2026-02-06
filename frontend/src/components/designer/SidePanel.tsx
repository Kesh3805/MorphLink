import { useDNAStore } from './dnaStore'

export function SidePanel() {
  const { selectedItem, dna, updateGene, updateOrgan, updateNeural, setSelectedItem } = useDNAStore()
  const { setDNA } = useDNAStore()

  if (!selectedItem) return null

  // Remove handlers
  const removeGene = (index: number) => {
    const genes = dna.genes.filter((_, i) => i !== index)
    setDNA({ ...dna, genes })
    setSelectedItem(null)
  }
  const removeOrgan = (name: string) => {
    const organs = { ...dna.organs }
    delete organs[name]
    setDNA({ ...dna, organs })
    setSelectedItem(null)
  }
  const removeNeural = (index: number) => {
    const neural_links = dna.neural_links.filter((_, i) => i !== index)
    setDNA({ ...dna, neural_links })
    setSelectedItem(null)
  }

  const renderGeneEditor = (index: number) => {
    const gene = dna.genes[index]
    if (!gene) return null
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Gene: {gene.name}</h3>
          <button className="text-red-400 hover:text-red-600 text-xl" onClick={() => removeGene(index)} title="Remove">✖</button>
        </div>
        <label className="block mb-1">Value:</label>
        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={gene.value}
          onChange={(e) => updateGene(index, parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="ml-2">{gene.value.toFixed(2)}</span>
      </div>
    )
  }

  const renderOrganEditor = (name: string) => {
    const organ = dna.organs[name]
    if (!organ) return null
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Organ: {name}</h3>
          <button className="text-red-400 hover:text-red-600 text-xl" onClick={() => removeOrgan(name)} title="Remove">✖</button>
        </div>
        <label className="block mb-1">Efficiency:</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={organ.efficiency}
          onChange={(e) => updateOrgan(name, 'efficiency', parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="ml-2">{organ.efficiency?.toFixed(1)}</span>
        <label className="block mt-2 mb-1">Neuron Count:</label>
        <input
          type="number"
          value={organ.neuron_count ?? ""}
          onChange={(e) => {
            const val = e.target.value === "" ? undefined : parseInt(e.target.value)
            if (val === undefined) {
              // Remove neuron_count from organ
              const organs = { ...dna.organs }
              delete organs[name].neuron_count
              setDNA({ ...dna, organs })
            } else {
              updateOrgan(name, 'neuron_count', val)
            }
          }}
          className="w-full"
        />
      </div>
    )
  }

  const renderNeuralEditor = (index: number) => {
    const link = dna.neural_links[index]
    if (!link) return null
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Neural Link</h3>
          <button className="text-red-400 hover:text-red-600 text-xl" onClick={() => removeNeural(index)} title="Remove">✖</button>
        </div>
        <label className="block mb-1">Input:</label>
        <input
          value={link.input}
          onChange={(e) => updateNeural(index, 'input', e.target.value)}
          className="w-full mb-2"
        />
        <label className="block mb-1">Output:</label>
        <input
          value={link.output}
          onChange={(e) => updateNeural(index, 'output', e.target.value)}
          className="w-full mb-2"
        />
        <label className="block mb-1">Weight:</label>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.1}
          value={link.weight}
          onChange={(e) => updateNeural(index, 'weight', parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="ml-2">{link.weight.toFixed(2)}</span>
      </div>
    )
  }

  return (
    <aside className="side-panel fixed top-0 right-0 w-80 h-full bg-slate-900 text-white p-6 border-l border-slate-700 z-50 overflow-y-auto">
      {selectedItem.type === 'gene' && renderGeneEditor(selectedItem.index)}
      {selectedItem.type === 'organ' && renderOrganEditor(selectedItem.name)}
      {selectedItem.type === 'neural' && renderNeuralEditor(selectedItem.index)}
    </aside>
  )
} 