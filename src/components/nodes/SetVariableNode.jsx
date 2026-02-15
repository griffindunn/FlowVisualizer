import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNodeShell from './BaseNodeShell';

const SetVariableNode = ({ data, selected }) => {
  const details = data.details || {};
  
  // 1. Identify Assignments
  // Newer WxCC exports use 'setVariablesArray', older ones use top-level props.
  let assignments = [];
  if (details.setVariablesArray && Array.isArray(details.setVariablesArray) && details.setVariablesArray.length > 0) {
    assignments = details.setVariablesArray;
  } else if (details.srcVariable) {
    // Fallback for single-variable config
    assignments = [details];
  }

  return (
    <BaseNodeShell data={data} selected={selected}>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>
          Assignments
        </div>
        
        {/* 2. List Each Assignment */}
        {assignments.map((item, index) => {
            // Logic to find the value being set:
            // Priority: expr (Logic) -> literal (Static) -> tgtVariable (Copy) -> 'null'
            let val = item.expr || item.literal || item.tgtVariable || 'null';
            
            // Clean up common JSON noise if present
            if (typeof val === 'string' && val.startsWith('{{') && val.endsWith('}}')) {
                // Optional: Strip {{ }} for cleaner reading, or keep them. keeping them implies dynamic.
            }

            return (
                <div key={index} style={{ 
                    marginBottom: '4px', 
                    fontSize: '10px', 
                    fontFamily: 'Consolas, Monaco, monospace', 
                    lineHeight: '1.4',
                    borderBottom: index < assignments.length - 1 ? '1px dashed #eee' : 'none',
                    paddingBottom: index < assignments.length - 1 ? '4px' : '0'
                }}>
                    <span style={{ color: '#005073', fontWeight: 'bold' }}>{item.srcVariable}</span>
                    <span style={{ color: '#999', margin: '0 4px' }}>=</span>
                    <span style={{ color: '#E65100', wordBreak: 'break-word' }}>{val}</span>
                </div>
            );
        })}

        {assignments.length === 0 && (
            <div style={{ fontSize: '10px', color: '#bbb', fontStyle: 'italic' }}>
                No variables configured
            </div>
        )}
      </div>

      {/* Success Output */}
      <div className="node-exit-row" style={{ marginTop: '4px', borderTop: '1px solid #eee', paddingTop: '4px' }}>
        <span className="exit-label">Success</span>
        <Handle type="source" position={Position.Right} id="default" className="source" />
      </div>
      
      {/* Error Output */}
      <div className="node-exit-row">
        <span className="exit-label" style={{ color: '#D32F2F' }}>Undefined Error</span>
        <Handle type="source" position={Position.Right} id="error" className="source" />
      </div>
    </BaseNodeShell>
  );
};

export default SetVariableNode;
