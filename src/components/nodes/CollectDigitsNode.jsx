import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const CollectDigitsNode = ({ data, selected }) => {
  const variableName = data.details?.variable || 'Digits';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px' }}>
         <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Store In</div>
         <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#005073' }}>{variableName}</div>
      </div>

      <div className="node-exit-row">
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>No-Input Timeout</span>
        <Handle type="source" position={Position.Right} id="timeout" className="source" />
      </div>
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>Unmatched Entry</span>
        <Handle type="source" position={Position.Right} id="invalid" className="source" />
      </div>
       <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>Undefined Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default CollectDigitsNode;
