import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const BusinessHoursNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px', fontSize: '11px', color: '#555' }}>
        Check Schedule
      </div>

      <div className="node-exit-row">
        <span className="exit-label">Open (Working Hours)</span>
        <Handle type="source" position={Position.Right} id="workingHours" className="source" />
      </div>
      <div className="node-exit-row">
        <span className="exit-label">Closed (Default)</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>
      <div className="node-exit-row">
        <span className="exit-label">Holiday</span>
        <Handle type="source" position={Position.Right} id="holidays" className="source" />
      </div>
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#E65100' }}>Override</span>
        <Handle type="source" position={Position.Right} id="override" className="source" />
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default BusinessHoursNode;
