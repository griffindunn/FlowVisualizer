// src/MainFlow.jsx
import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

// --- Import All Node Components ---
import StartNode from './components/nodes/StartNode';
import MenuNode from './components/nodes/MenuNode';
import CollectDigitsNode from './components/nodes/CollectDigitsNode';
import PlayMessageNode from './components/nodes/PlayMessageNode';
import PlayMusicNode from './components/nodes/PlayMusicNode';
import SetVariableNode from './components/nodes/SetVariableNode';
import ParseNode from './components/nodes/ParseNode';
import HTTPRequestNode from './components/nodes/HTTPRequestNode';
import BRERequestNode from './components/nodes/BRERequestNode';
import FunctionNode from './components/nodes/FunctionNode';
import CaseNode from './components/nodes/CaseNode';
import ConditionNode from './components/nodes/ConditionNode';
import BusinessHoursNode from './components/nodes/BusinessHoursNode';
import QueueContactNode from './components/nodes/QueueContactNode';
import QueueLookupNode from './components/nodes/QueueLookupNode';
import TransferNode from './components/nodes/TransferNode';
import HandoffNode from './components/nodes/HandoffNode';
import SubflowNode from './components/nodes/SubflowNode';
import DisconnectNode from './components/nodes/DisconnectNode';
import DefaultNode from './components/nodes/DefaultNode';

import DetailsPanel from './components/details/DetailsPanel';
import { transformWxccJson } from './processWxccJson';

// Register specific node types
const nodeTypes = {
  StartNode,
  MenuNode,
  CollectDigitsNode,
  PlayMessageNode,
  PlayMusicNode,
  SetVariableNode,
  ParseNode,
  HTTPRequestNode,
  BRERequestNode,
  FunctionNode,
  CaseNode,
  ConditionNode,
  BusinessHoursNode,
  QueueContactNode,
  QueueLookupNode,
  TransferNode,
  HandoffNode,
  SubflowNode,
  DisconnectNode,
  DefaultNode,
  // Header for event groups
  groupHeader: ({ data }) => <div style={{ fontSize: 24, borderBottom: '2px solid #ccc', color: '#888', marginBottom: 20 }}>{data.label}</div>,
};

const MainFlow = ({ fileContent }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  
  // React Flow state hooks for interactivity (dragging, selecting)
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useMemo(() => {
     if (fileContent) {
        const { nodes: initialNodes, edges: initialEdges } = transformWxccJson(fileContent);
        setNodes(initialNodes);
        setEdges(initialEdges);
     }
  }, [fileContent, setNodes, setEdges]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange} // Handles Dragging automatically
          onEdgesChange={onEdgesChange} // Handles Edge Selection
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodesDraggable={true} 
          fitView
          minZoom={0.05}
        >
          <Background color="#f0f0f0" gap={20} />
          <Controls />
        </ReactFlow>
        
        {/* The Details Panel Sidebar */}
        <DetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
};

export default MainFlow;
