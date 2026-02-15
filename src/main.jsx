import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  ReactFlowProvider,
  useReactFlow,
  Panel,
  Controls,
  Background
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
import SetCallerIDNode from './components/nodes/SetCallerIDNode'; // Import New Node
import DefaultNode from './components/nodes/DefaultNode';

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

function FlowVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  const fileInputRef = useRef(null);
  
  const { fitView } = useReactFlow();

  // --- FILE UPLOAD ---
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const { nodes: newNodes, edges: newEdges } = transformWxccJson(json);
        setNodes(newNodes);
        setEdges(newEdges);
        setFileLoaded(true);
        // Initial Zoom
        setTimeout(() => fitView({ padding: 0.2 }), 100);
      } catch (err) {
        console.error("Error parsing JSON:", err);
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

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
          
          {/* Top Right Control Panel */}
          <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
            <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                style={{ display: 'none' }} 
            />
            
            {/* Upload Button */}
            <button 
                onClick={() => fileInputRef.current.click()}
                style={{
                    background: '#fff',
                    border: '1px solid #ccc',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#555',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    fontSize: '13px'
                }}
            >
                📂 Upload Callflow
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

// --- BOOTSTRAP LOGIC ---
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ReactFlowProvider>
      <FlowVisualizer />
    </ReactFlowProvider>
  );
}

export default FlowVisualizer;
