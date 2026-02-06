import { Toolbox } from './Toolbox'
import { CreatureCanvas } from './CreatureCanvas'
import NeuralMap from './NeuralMap'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useDNAStore } from './dnaStore'
import { SidePanel } from './SidePanel'
import React, { useState } from 'react'

export function CreatureDesigner() {
  const { dna, setSelectedItem, setDNA, undo, redo, history, future } = useDNAStore()
  const [personality, setPersonality] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPersonality, setShowPersonality] = useState(false)

  // Export DNA as JSON file
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(dna, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'morphlink-dna.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import DNA from JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        setDNA(json)
        setSelectedItem(null)
      } catch (err) {
        alert('Invalid DNA JSON file.')
      }
    }
    reader.readAsText(file)
  }

  // Generate Personality
  const handleGeneratePersonality = async () => {
    setShowPersonality(true)
    setLoading(true)
    setError(null)
    setPersonality(null)
    try {
      const res = await fetch('http://localhost:8000/api/v1/creatures/personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dna }),
      })
      const data = await res.json()
      if (data.personality) setPersonality(data.personality)
      else setError(data.error || 'No response from AI')
    } catch (e) {
      setError('Failed to contact backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex w-full gap-6">
        <Toolbox />
        <CreatureCanvas setSelectedItem={setSelectedItem} />
        <div className="flex-1 min-w-[350px] max-w-[600px]">
          <NeuralMap />
        </div>
      </div>
      <div className="w-full mt-8 bg-slate-900 rounded-lg p-4">
        <div className="flex gap-4 mb-4 items-center">
          <button className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white font-semibold disabled:opacity-50" onClick={undo} disabled={history.length === 0}>
            Undo
          </button>
          <button className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white font-semibold disabled:opacity-50" onClick={redo} disabled={future.length === 0}>
            Redo
          </button>
          <button className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded text-white font-semibold ml-4" onClick={handleExport}>
            Export DNA
          </button>
          <label className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-white font-semibold cursor-pointer ml-2">
            Import DNA
            <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </label>
          <button className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded text-white font-semibold ml-4" onClick={handleGeneratePersonality}>
            Generate Personality
          </button>
          <button className="ml-2 px-3 py-2 rounded bg-slate-700 text-white font-semibold" onClick={() => setShowPersonality((v) => !v)}>
            {showPersonality ? 'Hide Personality' : 'Show Personality'}
          </button>
        </div>
        <h3 className="text-lg font-semibold mb-2">Live DNA JSON Preview</h3>
        <pre className="bg-slate-800 rounded p-4 text-green-300 overflow-x-auto text-sm">
          {JSON.stringify(dna, null, 2)}
        </pre>
        {showPersonality && (
          <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-purple-700">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🧠</span>
              <span className="text-lg font-bold text-purple-300">Synth Personality Report</span>
            </div>
            {loading && <div className="text-slate-300">Generating personality...</div>}
            {error && <div className="text-red-400">{error}</div>}
            {personality && <div className="whitespace-pre-line text-slate-100 mt-2">{personality}</div>}
          </div>
        )}
      </div>
      <SidePanel />
    </DndProvider>
  )
} 