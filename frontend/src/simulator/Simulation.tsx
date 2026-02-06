import React, { useEffect, useRef, useState } from "react";
import { generateWorld, GRID_WIDTH, GRID_HEIGHT, randomDNA } from "./world";
import type { Creature } from "./types";
import { simulateTick } from "./engine";
import { useDNAStore } from '../components/designer/dnaStore';

const CELL_SIZE = 20;

const colors = {
  empty: "#1e1e1e",
  light: "gold",
  food: "green",
  obstacle: "gray",
  pain: "red"
};

const creatureColors = ["#3498db", "#e91e63", "#f1c40f", "#9b59b6", "#00b894", "#fdcb6e", "#d63031", "#6c5ce7"];

function forcedMoveDNA(): Creature["dna"] {
  // Always produces move_up > 0.5 if in light, and move_right > 0.5 if in food
  return {
    genes: [
      { name: "Speed", value: 1.5 },
      { name: "Aggression", value: 1.0 }
    ],
    organs: {
      brain: { neuron_count: 100 },
      heart: { efficiency: 1.0 }
    },
    neural_links: [
      { input: "light", output: "move_up", weight: 1 },
      { input: "light", output: "move_down", weight: 0.5 },
      { input: "light", output: "move_left", weight: 0.5 },
      { input: "light", output: "move_right", weight: 0.5 },
      { input: "food", output: "move_up", weight: 0.5 },
      { input: "food", output: "move_down", weight: 0.5 },
      { input: "food", output: "move_left", weight: 0.5 },
      { input: "food", output: "move_right", weight: 1 },
      { input: "pain", output: "scream", weight: 1 }
    ]
  };
}

const Simulation: React.FC = () => {
  const { dna: designerDNA } = useDNAStore();
  const [world, setWorld] = useState(generateWorld());
  const [creatures, setCreatures] = useState<Creature[]>(() => {
    return [
      { id: 1, x: 2, y: 1, direction: "up", energy: 100, health: 100, color: creatureColors[0], dna: forcedMoveDNA() },
      { id: 2, x: 5, y: 17, direction: "up", energy: 100, health: 100, color: creatureColors[1], dna: randomDNA() },
      { id: 3, x: 10, y: 15, direction: "up", energy: 100, health: 100, color: creatureColors[2], dna: randomDNA() }
    ];
  });
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per tick

  // Use a ref to always access the latest creatures in the interval
  const creaturesRef = useRef(creatures);
  creaturesRef.current = creatures;

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const newCreatures = JSON.parse(JSON.stringify(creaturesRef.current));
      simulateTick(world, newCreatures);
      setCreatures(newCreatures);
      // Debug: log positions
      console.log("Tick", newCreatures.map((c: Creature) => ({ id: c.id, x: c.x, y: c.y, energy: c.energy, health: c.health })));
    }, speed);
    return () => clearInterval(interval);
  }, [world, paused, speed]);

  // Add designer creature to simulation
  const handleAddDesignerCreature = () => {
    // Find a random empty cell
    let x = 0, y = 0;
    let tries = 0;
    while (tries < 1000) {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
      if (world[y][x].type === "empty" && !creatures.some(c => c.x === x && c.y === y)) break;
      tries++;
    }
    const newId = creatures.length ? Math.max(...creatures.map(c => c.id)) + 1 : 1;
    const color = creatureColors[newId % creatureColors.length];
    setCreatures([...creatures, {
      id: newId,
      x,
      y,
      direction: "up",
      energy: 100,
      health: 100,
      color,
      dna: JSON.parse(JSON.stringify(designerDNA)),
    }]);
  };

  // Remove creature by id
  const handleRemoveCreature = (id: number) => {
    setCreatures(creatures.filter(c => c.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h3>Simulation World</h3>
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded font-semibold ${paused ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-700 hover:bg-gray-800'} text-white`}
          onClick={() => setPaused(p => !p)}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <label className="flex items-center gap-2">
          Speed:
          <select
            className="bg-slate-700 text-white rounded px-2 py-1"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          >
            <option value={1000}>Slow</option>
            <option value={500}>Normal</option>
            <option value={200}>Fast</option>
            <option value={50}>Ultra</option>
          </select>
        </label>
        <button
          className="px-4 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800"
          onClick={handleAddDesignerCreature}
        >
          Add Designer Creature
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)` }}>
        {world.flatMap((row, y) =>
          row.map((cell, x) => {
            const creature = creatures.find(c => c.x === x && c.y === y);
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: creature ? creature.color : colors[cell.type],
                  border: "1px solid #333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  color: "#fff",
                  cursor: creature ? 'pointer' : 'default',
                }}
                title={creature ? `Click to remove Creature ${creature.id}` : undefined}
                onClick={() => creature && handleRemoveCreature(creature.id)}
              >
                {creature ? creature.id : ""}
              </div>
            );
          })
        )}
      </div>
      <p style={{ marginTop: 8 }}>
        <b>Legend:</b> <span style={{ color: "gold" }}>■</span> Light &nbsp;
        <span style={{ color: "green" }}>■</span> Food &nbsp;
        <span style={{ color: "gray" }}>■</span> Obstacle &nbsp;
        <span style={{ color: "red" }}>■</span> Pain
      </p>
      <p className="mt-2 text-slate-400 text-xs">Click a creature to remove it.</p>
    </div>
  );
};

export default Simulation; 