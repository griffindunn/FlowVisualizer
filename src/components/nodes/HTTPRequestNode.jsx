import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const HTTPRequestNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px' }}>
         <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#555' }}>{data.details?.method || 'GET'}</div>
         <div style={{ fontSize: '10px', color: '#005073', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.details?.url || 'http://...'}
         </div>
      </div>

      <div className="node-exit-row">
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>Timeout</span>
        <Handle type="source" position={Position.Right} id="timeout" className="source" />
      </div>
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default HTTPRequestNode;
