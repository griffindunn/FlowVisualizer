import React, { useState, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css'; 
import { transformWxccJson } from './processWxccJson';
import WxccNode from './components/WxccNode';

const nodeTypes = {
  wxccNode: WxccNode,
  groupHeader: ({ data }) => (
    <div style={{ fontSize: 24, borderBottom: '2px solid #ccc', color: '#555', paddingBottom: 5, width: 400 }}>
      {data.label}
    </div>
  ),
};

const MainFlow = ({ fileContent }) => {
  const [showEvents, setShowEvents] = useState(false);

  const { nodes: allNodes, edges: allEdges } = useMemo(() => {
    if (!fileContent) return { nodes: [], edges: [] };
    return transformWxccJson(fileContent);
  }, [fileContent]);

  const visibleNodes = useMemo(() => showEvents ? allNodes : allNodes.filter(n => !n.data.isEventNode), [allNodes, showEvents]);
  const visibleEdges = useMemo(() => showEvents ? allEdges : allEdges.filter(e => !e.data?.isEventEdge), [allEdges, showEvents]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px', background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <strong style={{ fontSize: '18px', color: '#007aa3' }}>WxCC Visualizer</strong>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={showEvents} onChange={e => setShowEvents(e.target.checked)} />
          <span>Show Event Flows</span>
        </label>
        <div style={{flex: 1}} />
        <button onClick={() => window.location.reload()} style={{padding: '5px 10px', cursor: 'pointer'}}>Upload New File</button>
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={visibleNodes} edges={visibleEdges} nodeTypes={nodeTypes} fitView minZoom={0.05}>
          <Background gap={20} color="#f1f1f1" />
          <Controls />
          <MiniMap nodeStrokeWidth={3} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default MainFlow;
