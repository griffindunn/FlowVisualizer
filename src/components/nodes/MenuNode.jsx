import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const MenuNode = ({ data, selected }) => {
  // Retrieve the choices map populated by the JSON parser
  const choices = data.details?.choices || {};

  return (
    <BaseNodeShell data={data} selected={selected}>
      {/* Section Header */}
      <div style={{ 
        padding: '8px 0 4px 12px', 
        fontSize: '10px', 
        fontWeight: 'bold', 
        color: '#aaa', 
        textTransform: 'uppercase' 
      }}>
        Choices
      </div>

      {/* Dynamic Menu Choices Loop */}
      {Object.entries(choices).map(([key, label]) => (
        <div key={key} className="node-exit-row">
          {/* Key Badge (e.g. "1", "2") */}
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
          
          {/* Choice Label */}
          <span className="exit-label" title={label}>
            {label}
          </span>

          {/* Connection Dot */}
          <Handle 
            type="source" 
            position={Position.Right} 
            id={key} 
            className="source"
          />
        </div>
      ))}

      {/* Separator Line */}
      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

      {/* Standard Error Paths */}
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
