import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const SetVariableNode = ({ data, selected }) => {
  // data.details is typically an object like { varName: "value", var2: "value2" }
  const variables = data.details || {};

  return (
    <BaseNodeShell data={data} selected={selected}>
      {/* Variable List */}
      <div style={{ padding: '8px 12px' }}>
        {Object.entries(variables).slice(0, 5).map(([key, val]) => (
          <div key={key} style={{ fontSize: '11px', color: '#555', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 'bold' }}>{key}</span> = {String(val)}
          </div>
        ))}
        {Object.keys(variables).length > 5 && (
           <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
             + {Object.keys(variables).length - 5} more
           </div>
        )}
      </div>

      <div className="node-exit-row" style={{ marginTop: '5px' }}>
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>
      
      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#999' }}>Undefined Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default SetVariableNode;
