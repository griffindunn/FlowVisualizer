import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const TransferNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px', fontSize: '11px', color: '#005073', fontWeight: 'bold' }}>
        {data.details?.destination || 'Destination'}
      </div>

      <div className="node-exit-row">
        <span className="exit-label">Connected</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>Busy</span>
        <Handle type="source" position={Position.Right} id="busy" className="source" />
      </div>
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>No Answer</span>
        <Handle type="source" position={Position.Right} id="no_answer" className="source" />
      </div>
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>Invalid</span>
        <Handle type="source" position={Position.Right} id="invalid" className="source" />
      </div>
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default TransferNode;
