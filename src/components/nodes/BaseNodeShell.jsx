import React from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeConfig } from '../../wxccConfig';
import { getIconForType } from '../icons/NodeIcons'; // Import the icons

const styles = {
  container: (config, selected) => ({
    width: '280px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: selected 
      ? '0 0 0 2px #007AA3, 0 4px 12px rgba(0,0,0,0.15)' 
      : '0 1px 3px rgba(0,0,0,0.1)',
    fontFamily: '"CiscoSans", "Helvetica Neue", Arial, sans-serif',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid transparent',
  }),
  header: (config) => ({
    background: config.header,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    height: '48px', // Fixed 48px header
    borderBottom: `1px solid ${config.border}`,
    boxSizing: 'border-box'
  }),
  iconContainer: (config) => ({
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: config.icon,
    background: 'rgba(255,255,255,0.4)',
    borderRadius: '4px',
    flexShrink: 0
  }),
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  titleText: (config) => ({ 
    fontWeight: 600, 
    fontSize: '14px', 
    color: config.font || '#292929',
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    lineHeight: '1.2'
  }),
  subTitleText: { 
    fontSize: '11px', 
    color: '#555', 
    fontStyle: 'italic',
    marginTop: '2px'
  },
  body: { 
    padding: '0', 
    background: '#FFFFFF', 
    minHeight: '40px' 
  },
  
  // --- THE FIX ---
  // 48px (Header) + 10px (Margin Top of First Row) + 12px (Center of 24px Row) = 70px
  inputHandleWrapper: { 
    position: 'absolute', 
    top: '70px', 
    left: 0, 
    zIndex: 50 
  },
  inputHandle: { 
    left: '-5px', 
    width: '10px', 
    height: '10px', 
    background: '#555', 
    border: '2px solid #fff', 
    borderRadius: '50%' 
  }
};

const BaseNodeShell = ({ data, selected, children, showInput = true }) => {
  const config = getNodeConfig(data.nodeType);
  
  // Get specific icon based on node type
  const IconComponent = getIconForType(data.nodeType);

  return (
    <div style={styles.container(config, selected)}>
      {showInput && (
        <div style={styles.inputHandleWrapper}>
           <Handle type="target" position={Position.Left} style={styles.inputHandle} />
        </div>
      )}

      <div style={styles.header(config)}>
        <div style={styles.iconContainer(config)}>
           {IconComponent}
        </div>
        <div style={styles.headerContent}>
          <div style={styles.titleText(config)} title={data.label}>{data.label}</div>
          <div style={styles.subTitleText}>{config.label}</div>
        </div>
      </div>

      <div style={styles.body}>
        {children}
      </div>
    </div>
  );
};

export default BaseNodeShell;
