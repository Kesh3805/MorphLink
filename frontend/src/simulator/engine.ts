import type { Creature, GridCell, DNA, NeuralLink } from "./types";

// Helper: gather sensory inputs for a creature
function getInputs(creature: Creature, world: GridCell[][]): Record<string, number> {
  const cell = world[creature.y]?.[creature.x];
  const inputs: Record<string, number> = {};
  if (!cell) return inputs;
  // Light: 1 if in light zone
  inputs["light"] = cell.type === "light" ? 1 : 0;
  // Food: 1 if food in current cell
  inputs["food"] = cell.type === "food" ? 1 : 0;
  // Pain: 1 if pain in current cell
  inputs["pain"] = cell.type === "pain" ? 1 : 0;
  // (Add more as needed)
  return inputs;
}

// Helper: process neural net and return output activations
function processNeuralNet(dna: DNA, inputs: Record<string, number>): Record<string, number> {
  const outputs: Record<string, number> = {};
  for (const link of dna.neural_links) {
    const inputVal = inputs[link.input] ?? 0;
    outputs[link.output] = (outputs[link.output] ?? 0) + inputVal * link.weight;
  }
  return outputs;
}

function isValidMove(x: number, y: number, world: GridCell[][], creatures: Creature[]): boolean {
  return (
    x >= 0 && x < world[0].length &&
    y >= 0 && y < world.length &&
    world[y][x].type !== "obstacle" &&
    !creatures.some(c => c.x === x && c.y === y)
  );
}

export function simulateTick(world: GridCell[][], creatures: Creature[]) {
  for (const creature of creatures) {
    // Sense environment at current cell
    const cell = world[creature.y]?.[creature.x];
    if (!cell) continue;

    // Gather neural inputs
    const inputs = getInputs(creature, world);
    // Process neural net
    const outputs = processNeuralNet(creature.dna, inputs);

    // Debug: log move outputs
    console.log(`Creature ${creature.id} move_up:`, outputs["move_up"], "move_down:", outputs["move_down"], "move_left:", outputs["move_left"], "move_right:", outputs["move_right"]);

    // --- Neural-driven movement ---
    const moveOutputs = [
      { dir: { dx: 0, dy: -1 }, val: outputs["move_up"] ?? 0 },
      { dir: { dx: 0, dy: 1 }, val: outputs["move_down"] ?? 0 },
      { dir: { dx: -1, dy: 0 }, val: outputs["move_left"] ?? 0 },
      { dir: { dx: 1, dy: 0 }, val: outputs["move_right"] ?? 0 },
    ];
    const bestMove = moveOutputs.reduce((a, b) => (b.val > a.val ? b : a), moveOutputs[0]);
    if (bestMove.val > 0.5) {
      const newX = creature.x + bestMove.dir.dx;
      const newY = creature.y + bestMove.dir.dy;
      if (isValidMove(newX, newY, world, creatures)) {
        creature.x = newX;
        creature.y = newY;
        creature.energy -= 1; // cost of movement
      }
    }

    // Eat: if food present and output 'eat' > 0.8
    if ((outputs["eat"] ?? 0) > 0.8 && cell.type === "food") {
      creature.energy += 10;
      // Remove food from grid
      world[creature.y][creature.x].type = "empty";
    }

    // Rest: if output 'rest' > 0.8
    if ((outputs["rest"] ?? 0) > 0.8) {
      creature.energy += 0.5;
    }

    // Scream: if output 'scream' > 0.8, lose energy (for demo)
    if ((outputs["scream"] ?? 0) > 0.8) {
      creature.energy -= 2;
      // (Optional: flash cell, log, etc.)
    }

    // Pain: if in pain cell, lose health
    if (cell.type === "pain") {
      creature.health -= 5;
    }

    // Decrease energy (if not resting)
    if (!((outputs["rest"] ?? 0) > 0.8)) {
      creature.energy -= 1;
    }
  }
} 