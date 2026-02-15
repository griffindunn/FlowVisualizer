import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const MenuNode = ({ data, selected }) => {
  // Extract choices from the node properties
  // Data structure: data.details.choices usually contains the links
  const choices = data.details?.choices || {};

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 0 8px 12px', fontSize: '10px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' }}>
        Choices
      </div>

      {/* Render Dynamic Menu Choices */}
      {Object.entries(choices).map(([key, label]) => (
        <div key={key} className="node-exit-row">
          {/* Badge for the digit */}
          <div style={{ 
            background: '#fff', 
            border: '1px solid #ccc', 
            borderRadius: '12px', 
            padding: '0 6px', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: '#555', 
            marginRight: '8px',
            minWidth: '15px',
            textAlign: 'center'
          }}>
            {key}
          </div>
          <span className="exit-label" title={label}>{label}</span>
          <Handle 
            type="source" 
            position={Position.Right} 
            id={key} 
            className="source"
          />
        </div>
      ))}

      {/* Separator */}
      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      {/* Standard Menu Errors */}
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

export default MenuNode;
