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
  DefaultNode,
  groupHeader: DefaultNode 
};

function FlowVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  const fileInputRef = useRef(null);
  
  const { fitView, getNodes } = useReactFlow();

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

  // --- PDF EXPORT (CDN Version) ---
  const handleExportPDF = async () => {
    // Check if libraries loaded from index.html
    if (!window.html2canvas || !window.jspdf) {
        alert("PDF libraries not loaded. Please refresh the page.");
        return;
    }

    const { jsPDF } = window.jspdf;
    
    // 1. Setup Document (1920x1080 Landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1920, 1080]
    });

    // 2. Identify Node Groups (Main vs Events)
    const allNodes = getNodes();
    const mainNodes = allNodes.filter(n => !n.data.isEventNode && n.type !== 'groupHeader');
    const eventNodes = allNodes.filter(n => n.data.isEventNode || (n.id && String(n.id).startsWith('header-')));

    // 3. Helper: Capture Screenshot of specific node group
    const captureSection = async (nodesToFit) => {
        // Zoom flow to fit these specific nodes
        await fitView({ nodes: nodesToFit, padding: 0.1, duration: 0 });
        
        // Wait for renderer to settle (crucial for clean lines)
        await new Promise(r => setTimeout(r, 800));

        // Capture the wrapper
        const element = document.querySelector('.react-flow');
        const canvas = await window.html2canvas(element, {
            scale: 2, // High resolution
            useCORS: true,
            ignoreElements: (node) => {
                // Keep the canvas clean (hide buttons)
                return node.classList.contains('react-flow__panel');
            }
        });
        return canvas.toDataURL('image/png');
    };

    // --- PAGE 1: MAIN FLOW ---
    if (mainNodes.length > 0) {
        const imgData = await captureSection(mainNodes);
        pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
    }

    // --- PAGE 2: EVENT FLOWS (New Page) ---
    if (eventNodes.length > 0) {
        if (mainNodes.length > 0) pdf.addPage();
        const imgData = await captureSection(eventNodes);
        pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080);
    }

    pdf.save('Callflow_Export.pdf');
    
    // Restore View
    fitView({ padding: 0.2, duration: 500 });
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

            {/* Export Button (Shows when file loaded) */}
            {fileLoaded && (
                <button 
                    onClick={handleExportPDF}
                    style={{
                        background: '#005073',
                        border: '1px solid #003852',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        color: '#fff',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        fontSize: '13px'
                    }}
                >
                    📄 Export PDF
                </button>
            )}
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
