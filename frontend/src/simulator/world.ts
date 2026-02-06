import type { CellType, GridCell, DNA } from "./types";

export const GRID_WIDTH = 30;
export const GRID_HEIGHT = 20;

export function generateWorld(): GridCell[][] {
  const world: GridCell[][] = [];

  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      let type: CellType = "empty";

      // Top 3 rows = light zone
      if (y < 3) type = "light";
      // Random food
      else if (Math.random() < 0.07) type = "food";
      // Random obstacle
      else if (Math.random() < 0.06) type = "obstacle";
      // Random pain
      else if (Math.random() < 0.04) type = "pain";

      row.push({ x, y, type });
    }
    world.push(row);
  }

  return world;
}

export function randomDNA(): DNA {
  // Assign positive weights to each direction for movement
  return {
    genes: [
      { name: "Speed", value: Math.random() * 2 },
      { name: "Aggression", value: Math.random() * 2 }
    ],
    organs: {
      brain: { neuron_count: 50 + Math.floor(Math.random() * 100) },
      heart: { efficiency: 0.5 + Math.random() * 0.5 }
    },
    neural_links: [
      { input: "light", output: "move_up", weight: Math.random() * 0.8 + 0.2 },
      { input: "light", output: "move_down", weight: Math.random() * 0.8 + 0.2 },
      { input: "light", output: "move_left", weight: Math.random() * 0.8 + 0.2 },
      { input: "light", output: "move_right", weight: Math.random() * 0.8 + 0.2 },
      { input: "pain", output: "scream", weight: Math.random() * 2 - 1 },
      { input: "food", output: "eat", weight: Math.random() * 0.8 + 0.2 },
      { input: "pain", output: "move_down", weight: Math.random() * 0.8 + 0.2 },
      { input: "pain", output: "move_left", weight: Math.random() * 0.8 + 0.2 },
      { input: "pain", output: "move_right", weight: Math.random() * 0.8 + 0.2 },
      { input: "food", output: "move_up", weight: Math.random() * 0.8 + 0.2 },
      { input: "food", output: "move_down", weight: Math.random() * 0.8 + 0.2 },
      { input: "food", output: "move_left", weight: Math.random() * 0.8 + 0.2 },
      { input: "food", output: "move_right", weight: Math.random() * 0.8 + 0.2 },
    ]
  };
} 