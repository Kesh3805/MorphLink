import './App.css'
import { CreatureDesigner } from './components/designer/CreatureDesigner'
import Simulation from './simulator/Simulation'
import React, { useState } from 'react'

const TABS = [
  { key: 'designer', label: 'Designer' },
  { key: 'simulation', label: 'Simulation' },
  // { key: 'neural', label: 'Neural Map' },
]

export default function App() {
  const [tab, setTab] = useState('designer')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4 tracking-tight">🧬 MorphLink – Digital Organism Builder</h1>
      <p className="mb-8 text-lg max-w-2xl text-center">
        Create, evolve, and study synthetic life in a living digital ecosystem.<br/>
        <span className="text-slate-300">Drag & drop genes, organs, and neurons to build your own digital creatures. Watch them adapt, learn, and evolve in a dynamic world.</span>
      </p>
      <div className="w-full max-w-5xl bg-slate-800 rounded-lg shadow-lg p-6 min-h-[300px] flex flex-col">
        <div className="flex gap-4 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 rounded-t font-semibold ${tab === t.key ? 'bg-slate-900 text-purple-300' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          {tab === 'designer' && <CreatureDesigner />}
          {tab === 'simulation' && <Simulation />}
        </div>
      </div>
    </div>
  )
}
