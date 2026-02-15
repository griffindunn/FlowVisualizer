import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const BusinessHoursNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px', fontSize: '11px', color: '#555' }}>
        Check Schedule
      </div>

      {/* 1. Working Hours (Open) */}
      <div className="node-exit-row">
        <span className="exit-label">Working Hours</span>
        <Handle type="source" position={Position.Right} id="workingHours" className="source" />
      </div>

      {/* 2. Holidays */}
      <div className="node-exit-row">
        <span className="exit-label">Holidays</span>
        {/* Note: JSON often uses 'holiday' or 'holidays'. Ensure parser maps correctly. */}
        <Handle type="source" position={Position.Right} id="holiday" className="source" />
      </div>

      {/* 3. Override (Force Close/Open) */}
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#E65100' }}>Override</span>
        <Handle type="source" position={Position.Right} id="override" className="source" />
      </div>

      {/* 4. Default (Closed/Other) */}
      <div className="node-exit-row">
        <span className="exit-label">Default</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      {/* 5. Undefined Error */}
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Undefined Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default BusinessHoursNode;
