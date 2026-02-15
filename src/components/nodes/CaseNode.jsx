import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const CaseNode = ({ data, selected }) => {
  const cases = data.details?.cases || {};

  return (
    <BaseNodeShell data={data} selected={selected}>
       <div style={{ padding: '8px 0 4px 12px', fontSize: '10px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' }}>
        Cases
      </div>

      {Object.entries(cases).map(([key, label]) => (
        <div key={key} className="node-exit-row">
           <div style={{ 
            background: '#fff', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            padding: '0 4px', 
            fontSize: '10px', 
            color: '#555', 
            marginRight: '8px'
          }}>
            {key}
          </div>
          <span className="exit-label" title={label} style={{ maxWidth: '140px' }}>
            {label}
          </span>
          <Handle type="source" position={Position.Right} id={key} className="source" />
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
