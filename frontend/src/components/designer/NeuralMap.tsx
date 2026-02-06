import React, { useState, useRef } from 'react';
import { Stage, Layer, Circle, Text, Arrow } from 'react-konva';
import { useDNAStore } from './dnaStore';
import type { NeuralLink } from './dnaStore';

interface Pulse {
  edgeIndex: number;
  progress: number; // 0 to 1
  color: string;
}

export default function NeuralMap() {
  const neuralLinks = useDNAStore((s) => s.dna.neural_links);

  const inputs = [...new Set(neuralLinks.map(link => link.input))];
  const outputs = [...new Set(neuralLinks.map(link => link.output))];

  const nodeRadius = 20;
  const spacing = 80;
  const inputStartY = 100;
  const outputStartY = 100;

  const [hoveredEdge, setHoveredEdge] = useState<NeuralLink | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [firing, setFiring] = useState(false);
  const [glowIntensities, setGlowIntensities] = useState<{ [node: string]: number }>({});
  const animationRef = useRef<number | null>(null);

  const nodeColor = (weight: number) => weight > 0 ? '#4ade80' : '#f87171'; // green vs red

  // Helper to check if a node is selected
  const isNodeSelected = (name: string) => selectedNode === name;
  // Helper to check if an edge is highlighted
  const isEdgeHighlighted = (link: NeuralLink) =>
    selectedNode && (link.input === selectedNode || link.output === selectedNode);

  // Animation loop
  React.useEffect(() => {
    if (pulses.length === 0 && Object.keys(glowIntensities).length === 0) return;
    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000; // seconds
      lastTime = now;
      setPulses((prev) =>
        prev
          .map((pulse) => ({ ...pulse, progress: pulse.progress + dt * 1.5 })) // 1.5 = speed
          .filter((pulse) => pulse.progress <= 1)
      );
      setGlowIntensities((prev) => {
        const next: typeof prev = {};
        for (const key in prev) {
          const decayed = prev[key] * 0.92; // decay factor
          if (decayed > 0.05) next[key] = decayed;
        }
        return next;
      });
      if (pulses.length > 0 || Object.keys(glowIntensities).length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line
  }, [pulses.length, Object.keys(glowIntensities).length]);

  // Handle edge click to trigger pulse
  const handleEdgeClick = (edgeIndex: number, link: NeuralLink) => {
    setPulses((prev) => [
      ...prev,
      {
        edgeIndex,
        progress: 0,
        color: nodeColor(link.weight),
      },
    ]);
  };

  // Recursive propagation
  const propagateSignal = (nodeName: string, visited: Set<string> = new Set()) => {
    if (visited.has(nodeName)) return;
    visited.add(nodeName);
    // Find all outgoing edges
    const triggeredEdges = neuralLinks
      .map((link, i) => ({ link, i }))
      .filter(({ link }) => link.input === nodeName);
    // Fire pulses and activate outputs
    triggeredEdges.forEach(({ link, i }) => {
      handleEdgeClick(i, link);
      setActiveNodes((prev) => [...new Set([...prev, link.output])]);
      // Animate glow intensity based on weight
      setGlowIntensities((prev) => ({ ...prev, [link.output]: Math.max(prev[link.output] || 0, Math.abs(link.weight)) }));
      // If output is also an input, propagate recursively
      if (inputs.includes(link.output)) {
        setTimeout(() => propagateSignal(link.output, visited), 200); // slight delay for effect
      }
    });
    // Optionally highlight the input node as well
    setActiveNodes((prev) => [...new Set([...prev, nodeName, ...triggeredEdges.map(({ link }) => link.output)])]);
    setGlowIntensities((prev) => ({ ...prev, [nodeName]: Math.max(prev[nodeName] || 0, 0.7) }));
    setTimeout(() => setActiveNodes([]), 1000);
  };

  // Handle input node click to propagate signal recursively
  const handleInputNodeClick = (nodeName: string) => {
    propagateSignal(nodeName);
  };

  // Fire all inputs
  const handleFireAll = () => {
    if (firing) return;
    setFiring(true);
    inputs.forEach((input, idx) => {
      setTimeout(() => propagateSignal(input), idx * 100); // stagger for effect
    });
    setTimeout(() => setFiring(false), 1200);
  };

  return (
    <div style={{ flex: 1, height: 400, position: 'relative' }}>
      <button
        className="mb-2 px-4 py-2 rounded bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-50"
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 20 }}
        onClick={handleFireAll}
        disabled={firing}
      >
        Fire All Inputs
      </button>
      <Stage width={600} height={400} style={{ marginTop: 40 }}>
        <Layer>
          {inputs.map((name, i) => (
            <React.Fragment key={`i-${i}`}>
              <Circle
                x={100}
                y={inputStartY + i * spacing}
                radius={nodeRadius}
                fill={activeNodes.includes(name) ? 'yellow' : '#93c5fd'}
                shadowBlur={glowIntensities[name] ? 15 + 30 * glowIntensities[name] : (activeNodes.includes(name) ? 15 : 0)}
                stroke={isNodeSelected(name) ? 'yellow' : 'black'}
                strokeWidth={isNodeSelected(name) ? 4 : 1}
                onClick={() => handleInputNodeClick(name)}
              />
              <Text text={name} x={60} y={inputStartY + i * spacing - 6} width={80} align="center" />
            </React.Fragment>
          ))}
          {outputs.map((name, i) => (
            <React.Fragment key={`o-${i}`}>
              <Circle
                x={500}
                y={outputStartY + i * spacing}
                radius={nodeRadius}
                fill={activeNodes.includes(name) ? 'yellow' : '#fcd34d'}
                shadowBlur={glowIntensities[name] ? 15 + 30 * glowIntensities[name] : (activeNodes.includes(name) ? 15 : 0)}
                stroke={isNodeSelected(name) ? 'yellow' : 'black'}
                strokeWidth={isNodeSelected(name) ? 4 : 1}
                onClick={() => setSelectedNode(selectedNode === name ? null : name)}
              />
              <Text text={name} x={460} y={outputStartY + i * spacing - 6} width={80} align="center" />
            </React.Fragment>
          ))}
          {neuralLinks.map((link, i) => {
            const inputIndex = inputs.indexOf(link.input);
            const outputIndex = outputs.indexOf(link.output);
            const highlighted = isEdgeHighlighted(link);
            const x1 = 120, y1 = inputStartY + inputIndex * spacing;
            const x2 = 480, y2 = outputStartY + outputIndex * spacing;
            return (
              <React.Fragment key={`arrow-${i}`}>
                <Arrow
                  points={[x1, y1, x2, y2]}
                  stroke={nodeColor(link.weight)}
                  strokeWidth={highlighted ? 6 : Math.abs(link.weight) * 4 + 1}
                  opacity={selectedNode && !highlighted ? 0.2 : 1}
                  pointerLength={10}
                  pointerWidth={8}
                  onMouseEnter={e => {
                    setHoveredEdge(link);
                    const stage = e.target.getStage();
                    if (stage) {
                      const pointer = stage.getPointerPosition();
                      if (pointer) setMousePosition({ x: pointer.x, y: pointer.y });
                    }
                  }}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={() => handleEdgeClick(i, link)}
                  listening={true}
                />
                {/* Render pulses for this edge */}
                {pulses.filter(p => p.edgeIndex === i).map((pulse, j) => {
                  // Interpolate position
                  const px = x1 + (x2 - x1) * pulse.progress;
                  const py = y1 + (y2 - y1) * pulse.progress;
                  return (
                    <Circle
                      key={`pulse-${i}-${j}`}
                      x={px}
                      y={py}
                      radius={7}
                      fill={pulse.color}
                      shadowBlur={10}
                      opacity={0.8}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
      {hoveredEdge && (
        <div
          style={{
            position: 'absolute',
            top: mousePosition.y + 10,
            left: mousePosition.x + 10,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '6px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <strong>{hoveredEdge.input} → {hoveredEdge.output}</strong><br />
          Weight: {hoveredEdge.weight}<br />
          Type: {hoveredEdge.weight > 0 ? 'Excitatory' : 'Inhibitory'}
        </div>
      )}
    </div>
  );
} 