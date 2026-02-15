import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const ParseNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
       <div style={{ padding: '8px 12px', fontSize: '11px', color: '#555' }}>
         Input: <strong>{data.details?.inputVariable || 'N/A'}</strong>
      </div>

      <div className="node-exit-row">
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default ParseNode;
