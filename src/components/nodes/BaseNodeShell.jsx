// src/components/nodes/BaseNodeShell.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';
import { getNodeConfig } from '../../wxccConfig';
import { getIconForType } from '../icons/NodeIcons';

const styles = {
  container: (config) => ({
    width: '280px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    fontFamily: '"CiscoSans", "Helvetica Neue", Arial, sans-serif',
    overflow: 'visible', 
    position: 'relative',
    border: '1px solid transparent',
  }),
  header: (config) => ({
    background: config.header,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    height: '48px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
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
  headerTextCol: {
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
    minHeight: '40px',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
  }
};

const BaseNodeShell = ({ data, selected, children, showInput = true }) => {
  const config = getNodeConfig(data.nodeType);
  const IconComponent = getIconForType(data.nodeType);

  return (
    <div className={`node-container ${selected ? 'selected' : ''}`} style={styles.container(config)}>
      {showInput && (
        <Handle 
          type="target" 
          position={Position.Left} 
          id="in"
        />
      )}

      <div style={styles.header(config)}>
        <div style={styles.iconContainer(config)}>
           {IconComponent}
        </div>
        <div style={styles.headerTextCol} className="node-header-content">
          <div style={styles.titleText(config)} title={data.label}>{data.label}</div>
          <div style={styles.subTitleText}>{config.label}</div>
        </div>
      </div>

      <div style={styles.body}>
        {/* Children will populate the rows (Exit handles, etc.) */}
        {/* We expect children to use the css class 'node-exit-row' for handles */}
        {children}
      </div>
    </div>
  );
};

export default BaseNodeShell;
