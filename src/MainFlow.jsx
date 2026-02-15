import React, { useEffect } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  ReactFlowProvider,
  useReactFlow,
  Controls,
  Background,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

// Logic
import { transformWxccJson } from './processWxccJson';

// Node Components
import StartNode from './components/nodes/StartNode';
import MenuNode from './components/nodes/MenuNode';
import PlayMessageNode from './components/nodes/PlayMessageNode';
import SetVariableNode from './components/nodes/SetVariableNode';
import QueueContactNode from './components/nodes/QueueContactNode';
import ConditionNode from './components/nodes/ConditionNode';
import QueueLookupNode from './components/nodes/QueueLookupNode';
import HandoffNode from './components/nodes/HandoffNode';
import BusinessHoursNode from './components/nodes/BusinessHoursNode';
import CaseNode from './components/nodes/CaseNode';
import ParseNode from './components/nodes/ParseNode';
import HTTPRequestNode from './components/nodes/HTTPRequestNode';
import BRERequestNode from './components/nodes/BRERequestNode';
import DefaultNode from './components/nodes/DefaultNode';
import SetCallerIDNode from './components/nodes/SetCallerIDNode'; // Import New Node

// --- CONFIG ---
const nodeTypes = {
  StartNode,
  MenuNode,
  PlayMessageNode,
  SetVariableNode,
  QueueContactNode,
  ConditionNode,
  QueueLookupNode,
  HandoffNode,
  BusinessHoursNode,
  CaseNode,
  ParseNode,
  HTTPRequestNode,
  BRERequestNode,
  SetCallerIDNode, // Register New Node
  DefaultNode,
  groupHeader: DefaultNode 
};

// Inner Component to handle ReactFlow Hooks
const FlowRenderer = ({ fileContent }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (fileContent) {
      const { nodes: newNodes, edges: newEdges } = transformWxccJson(fileContent);
      setNodes(newNodes);
      setEdges(newEdges);
      
      // Wait for render then zoom
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [fileContent, setNodes, setEdges, fitView]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          minZoom={0.05}
          fitView
        >
          <Background color="#aaa" gap={20} />
          <Controls />
          {/* Legend or other panels can go here */}
        </ReactFlow>
      </div>
    </div>
  );
};

// Wrapper Component
const MainFlow = ({ fileContent }) => {
  return (
    <ReactFlowProvider>
      <FlowRenderer fileContent={fileContent} />
    </ReactFlowProvider>
  );
};

export default MainFlow;
