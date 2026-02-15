import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const CaseNode = ({ data, selected }) => {
  // Now we expect an Array: [{ id: "1", label: "Test" }, ...]
  const cases = data.details?.cases || [];

  return (
    <BaseNodeShell data={data} selected={selected}>
       <div style={{ padding: '8px 0 4px 12px', fontSize: '10px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' }}>
        Cases
      </div>

      {/* Render based on Ordered Array */}
      {cases.map((c) => (
        <div key={c.id} className="node-exit-row">
           <div style={{ 
            background: '#fff', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            padding: '0 4px', 
            fontSize: '10px', 
            color: '#555', 
            marginRight: '8px'
          }}>
            {c.id}
          </div>
          <span className="exit-label" title={c.label}>
            {c.label}
          </span>
          <Handle type="source" position={Position.Right} id={c.id} className="source" />
        </div>
      ))}

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      <div className="node-exit-row">
        <span className="exit-label">Default</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default CaseNode;
