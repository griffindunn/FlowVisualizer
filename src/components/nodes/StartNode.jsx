import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const StartNode = ({ data, selected }) => {
  return (
    <BaseNodeShell data={data} selected={selected} showInput={false}>
      {/* Output Row */}
      <div className="node-exit-row" style={{ marginTop: '10px' }}>
        <span className="exit-label">Start</span>
        <Handle 
          type="source" 
          position={Position.Right} 
          id="default" 
          className="source" // Important for CSS targeting
        />
      </div>
    </BaseNodeShell>
  );
};

export default StartNode;
