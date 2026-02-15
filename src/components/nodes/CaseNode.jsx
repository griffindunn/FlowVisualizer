import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const CaseNode = ({ data, selected }) => {
  // Array of cases: [{ id: "0", label: "Test" }, { id: "1", label: "Dev" }]
  const cases = data.details?.cases || [];

  return (
    <BaseNodeShell data={data} selected={selected}>
       <div style={{ 
         padding: '8px 0 4px 12px', 
         fontSize: '10px', 
         fontWeight: 'bold', 
         color: '#aaa', 
         textTransform: 'uppercase' 
       }}>
        Cases
      </div>

      {/* Render based on Ordered Array */}
      {cases.map((c) => (
        <div key={c.id} className="node-exit-row">
          {/* Badge Removed: Just show the label directly */}
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
