import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import global styles (Critical for handle/dot positioning fixes)
import './index.css';

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
      fontSize: 24, 
      borderBottom: '2px solid #ccc', 
      color: '#888', 
      marginBottom: 20, 
      minWidth: '400px',
      fontFamily: '"CiscoSans", "Helvetica Neue", Arial, sans-serif'
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
  
  // These states hold ALL nodes (both visible and hidden)
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Visibility State for Event Flows
  const [showEvents, setShowEvents] = useState(false);

  // 1. Initial Data Load
  useMemo(() => {
     if (fileContent) {
        const { nodes: initialNodes, edges: initialEdges } = transformWxccJson(fileContent);
        setNodes(initialNodes);
        setEdges(initialEdges);
     }
  }, [fileContent, setNodes, setEdges]);

  // 2. Auto Layout Handler
  const onLayout = useCallback(() => {
    // We pass the full set of nodes to the layout engine so it can calculate
    // the proper stacking (Main on top, Events below).
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    // Update state with new positions
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  // 3. Filtering Logic for Display
  // If showEvents is false, filter out nodes/edges tagged as part of an event
  const visibleNodes = showEvents 
    ? nodes 
    : nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');

  const visibleEdges = showEvents 
    ? edges 
    : edges.filter(e => !e.data?.isEventEdge);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
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
          
          {/* Top Right Controls Panel */}
          <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
            
            {/* Toggle Visibility Button */}
            <button 
              onClick={() => setShowEvents(!showEvents)}
              style={{
                background: showEvents ? '#E1F5FE' : 'white',
                border: '1px solid #ccc',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: showEvents ? '#0277BD' : '#555',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {showEvents ? '👁️ Hide Global Events' : '👁️ Show Global Events'}
            </button>

            {/* Auto Layout Button */}
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
                fontSize: '13px'
              }}
            >
              <span>✨</span> Auto Layout
            </button>
          </Panel>

        </ReactFlow>
        <DetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
};

export default MainFlow;
