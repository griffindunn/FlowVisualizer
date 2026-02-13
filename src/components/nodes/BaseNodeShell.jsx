// src/components/nodes/BaseNodeShell.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeConfig } from '../../wxccConfig';

const styles = {
  container: (config, selected) => ({
    minWidth: '260px',
    maxWidth: '350px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: selected ? '0 0 0 2px #007AA3, 0 4px 12px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)',
    border: `1px solid ${config.border}`,
    fontFamily: '"CiscoSans", sans-serif',
    fontSize: '13px',
    position: 'relative'
  }),
  header: (config) => ({
    background: config.header,
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'white',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    height: '45px', // Fixed height ensures consistency
    boxSizing: 'border-box'
  }),
  titleText: { fontWeight: 600, fontSize: '14px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  typeText: { fontSize: '10px', opacity: 0.9, textTransform: 'uppercase' },
  body: { 
    padding: '0', // We control padding inside rows now 
    background: '#fafafa', 
    minHeight: '40px', 
    borderBottomLeftRadius: '8px', 
    borderBottomRightRadius: '8px' 
  },
  // TARGET: Exactly 45px (Header) + 10px (Margin) + 12px (Half Row Height) = 67px
  inputHandleWrapper: { 
    position: 'absolute', 
    top: '67px', 
    left: 0, 
    zIndex: 50 
  },
  inputHandle: { 
    left: '-6px', 
    width: '12px', 
    height: '12px', 
    background: '#555', 
    border: '2px solid #fff', 
    borderRadius: '50%' 
  }
};

const BaseNodeShell = ({ data, selected, children, showInput = true }) => {
  const config = getNodeConfig(data.nodeType);
  
  return (
    <div style={styles.container(config, selected)}>
      {showInput && (
        <div style={styles.inputHandleWrapper}>
           <Handle type="target" position={Position.Left} style={styles.inputHandle} />
        </div>
      )}

      <div style={styles.header(config)}>
        <div style={styles.titleText} title={data.label}>{data.label}</div>
        <div style={styles.typeText}>{config.label}</div>
      </div>

      <div style={styles.body}>
        {children}
      </div>
    </div>
  );
};

export default BaseNodeShell;
