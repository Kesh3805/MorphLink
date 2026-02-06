export type CellType = "empty" | "light" | "food" | "obstacle" | "pain";

export interface GridCell {
  type: CellType;
  x: number;
  y: number;
}

export type NeuralLink = {
  input: string;
  output: string;
  weight: number;
};

export type DNA = {
  genes: { name: string; value: number }[];
  organs: Record<string, { efficiency?: number; neuron_count?: number }>;
  neural_links: NeuralLink[];
};

export interface Creature {
  id: number;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  energy: number;
  health: number;
  color: string;
  dna: DNA;
} 