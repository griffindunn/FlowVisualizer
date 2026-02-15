import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const BRERequestNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px', fontSize: '11px', color: '#555' }}>
        BRE Execution
      </div>

      <div className="node-exit-row">
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default BRERequestNode;
