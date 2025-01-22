import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface TopologyViewProps {
  rules: Array<{
    sourceIp: string;
    destinationIp: string;
  }>;
  onClose: () => void;
}

const TopologyView: React.FC<TopologyViewProps> = ({ rules, onClose }) => {
  // Créer un Map pour stocker les couleurs uniques par destination
  const destinationColors = new Map();
  const colors = ['#4287f5', '#f542aa', '#42f554', '#f5d442', '#f54242'];
  
  // Extraire les IPs uniques
  const uniqueIps = new Set([
    ...rules.map(rule => rule.sourceIp),
    ...rules.map(rule => rule.destinationIp)
  ]);

  // Assigner des couleurs aux destinations
  let colorIndex = 0;
  rules.forEach(rule => {
    if (!destinationColors.has(rule.destinationIp)) {
      destinationColors.set(rule.destinationIp, colors[colorIndex % colors.length]);
      colorIndex++;
    }
  });

  // Créer les nœuds
  const initialNodes = Array.from(uniqueIps).map((ip, index) => {
    const isDestination = rules.some(rule => rule.destinationIp === ip);
    return {
      id: ip,
      data: { label: ip },
      position: { 
        x: isDestination ? 400 : 100, 
        y: index * 100 + 50 
      },
      style: {
        background: isDestination ? destinationColors.get(ip) : '#000000',
        color: isDestination ? '#000000' : '#ffffff',
        padding: 10,
        borderRadius: 5,
        border: '1px solid #000000',
      },
    };
  });

  // Créer les connexions
  const initialEdges = rules.map((rule, index) => ({
    id: `e${index}`,
    source: rule.sourceIp,
    target: rule.destinationIp,
    style: { stroke: destinationColors.get(rule.destinationIp) },
    animated: true,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Fermer
        </button>
      </div>
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};

export default TopologyView;