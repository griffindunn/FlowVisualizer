import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const QueueLookupNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px', fontSize: '11px', color: '#555' }}>
        Get Queue Stats
      </div>

      {/* Success Output */}
      <div className="node-exit-row">
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      {/* Insufficient Data Output */}
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>Insufficient Data</span>
        <Handle type="source" position={Position.Right} id="insufficient_data" className="source" />
      </div>

      {/* Failure Output */}
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Failure</span>
        <Handle type="source" position={Position.Right} id="failure" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default QueueLookupNode;
