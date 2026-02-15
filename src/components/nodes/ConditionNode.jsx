import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const ConditionNode = ({ data, selected }) => {
  // Extract the specific expression from the JSON properties
  const expression = data.details?.expression || 'Condition Expression';

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px' }}>
        <div 
          style={{ 
            fontSize: '11px', 
            color: '#858585', 
            fontStyle: 'italic', 
            background: '#f9f9f9', 
            padding: '4px', 
            borderRadius: '4px', 
            border: '1px solid #eee',
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}
          title={expression} // Tooltip for long expressions
        >
          {expression}
        </div>
      </div>

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      {/* True Path */}
      <div className="node-exit-row">
        <span className="exit-label">True</span>
        <Handle type="source" position={Position.Right} id="true" className="source" />
      </div>

      {/* False Path */}
      <div className="node-exit-row">
        <span className="exit-label">False</span>
        <Handle type="source" position={Position.Right} id="false" className="source" />
      </div>

      {/* Error Path */}
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Undefined Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default ConditionNode;
