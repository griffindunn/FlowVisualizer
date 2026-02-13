import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

// Nodes
import MenuNode from './components/nodes/MenuNode';
import LogicNode from './components/nodes/LogicNode';
import ActionNode from './components/nodes/ActionNode';
import TerminatorNode from './components/nodes/TerminatorNode';
import StartNode from './components/nodes/StartNode';

// Detail Panel
import DetailsPanel from './components/details/DetailsPanel';
import { transformWxccJson } from './processWxccJson';

const nodeTypes = {
  MenuNode, 
  LogicNode, 
  ActionNode, 
  TerminatorNode, 
  StartNode,
  groupHeader: ({ data }) => <div style={{ fontSize: 24, borderBottom: '2px solid #ccc', color: '#888' }}>{data.label}</div>,
};

const MainFlow = ({ fileContent }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useMemo(() => {
     if (fileContent) {
        const { nodes: initialNodes, edges: initialEdges } = transformWxccJson(fileContent);
        setNodes(initialNodes);
        setEdges(initialEdges);
     }
  }, [fileContent, setNodes, setEdges]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodesDraggable={true} 
          fitView
          minZoom={0.05}
        >
          <Background color="#f0f0f0" gap={20} />
          <Controls />
        </ReactFlow>
        <DetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
};

export default MainFlow;
