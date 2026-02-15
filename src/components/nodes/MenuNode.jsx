import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const MenuNode = ({ data, selected }) => {
  // Now we expect an Array: [{ id: "9", label: "Language" }, ...]
  const choices = data.details?.choices || [];

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 0 4px 12px', fontSize: '10px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' }}>
        Choices
      </div>

      {/* Render based on Ordered Array */}
      {choices.map((choice) => (
        <div key={choice.id} className="node-exit-row">
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
            {choice.id}
          </div>
          <span className="exit-label" title={choice.label}>{choice.label}</span>
          <Handle 
            type="source" 
            position={Position.Right} 
            id={choice.id} 
            className="source"
          />
        </div>
      ))}

      <div style={{ height: '1px', background: '#eee', margin: '6px 0' }} />

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
