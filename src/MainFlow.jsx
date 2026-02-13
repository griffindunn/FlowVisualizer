// src/MainFlow.jsx
import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- Nodes ---
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

// --- Edges ---
import CurvedLoopEdge from './components/edges/CurvedLoopEdge';

// --- Utils ---
import DetailsPanel from './components/details/DetailsPanel';
import { transformWxccJson } from './processWxccJson';
import { getLayoutedElements } from './utils/autoLayout'; 

const nodeTypes = {
  StartNode, MenuNode, CollectDigitsNode, PlayMessageNode, PlayMusicNode,
  SetVariableNode, ParseNode, HTTPRequestNode, BRERequestNode, FunctionNode,
  CaseNode, ConditionNode, BusinessHoursNode, QueueContactNode, QueueLookupNode,
  TransferNode, HandoffNode, SubflowNode, DisconnectNode, DefaultNode,
  groupHeader: ({ data }) => (
    <div style={{ 
      fontSize: 24, borderBottom: '2px solid #ccc', color: '#888', 
      marginBottom: 20, minWidth: '400px' 
    }}>
      {data.label}
    </div>
  ),
};

const edgeTypes = {
  curvedLoop: CurvedLoopEdge,
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

  // Layout Handler
  const onLayout = useCallback(() => {
    // Run our custom pure-JS layout engine
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
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
          
          {/* Custom Button positioned absolutely (No external deps) */}
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 5 }}>
            <button 
              onClick={onLayout}
              style={{
                background: 'white',
                border: '1px solid #ccc',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#333',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <span>✨</span> Auto Layout
            </button>
          </div>

        </ReactFlow>
        <DetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
};

export default MainFlow;
