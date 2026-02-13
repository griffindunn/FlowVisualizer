// src/components/WxccNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// --- Styles ---
const styles = {
  nodeContainer: {
    minWidth: '250px',
    maxWidth: '350px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
    fontFamily: '"CiscoSans", sans-serif',
    fontSize: '13px',
    position: 'relative'
  },
  header: (bg, border) => ({
    background: '#fff',
    borderBottom: '1px solid #eee',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }),
  iconBox: (bg) => ({
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#fff',
    flexShrink: 0
  }),
  titleBox: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  title: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  subTitle: {
    fontSize: '11px',
    color: '#888'
  },
  body: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: '#fafafa' // Light gray background for body
  },
  // Row for Links
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    height: '34px',
    marginBottom: '4px'
  },
  // The digit pill (1, 2, 3)
  digitPill: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '2px 8px',
    minWidth: '20px',
    textAlign: 'center',
    fontWeight: '600',
    color: '#555',
    marginRight: '8px',
    flexShrink: 0
  },
  // The description gray box
  descBox: {
    background: '#e6e6e6',
    borderRadius: '4px',
    padding: '6px 10px',
    flexGrow: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#666',
    marginRight: '10px' // Space for handle
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginTop: '5px',
    marginBottom: '5px',
    paddingLeft: '5px'
  },
  // Handles
  handleLeft: { 
    left: '-6px', 
    width: '12px', 
    height: '12px', 
    background: '#555',
    border: '2px solid #fff'
  },
  handleRight: { 
    right: '-6px', 
    width: '12px', 
    height: '12px', 
    background: '#555', 
    border: '2px solid #fff'
  },
  handleError: {
    right: '-6px', 
    width: '10px', 
    height: '10px', 
    background: '#999', 
    border: '2px solid #fff' 
  }
};

// --- Webex Color Logic ---
const getCategoryInfo = (type) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('menu')) return { bg: '#F2D075', icon: 'dw-menu', label: 'Menu' }; // Orange/Yellow
  if (t.includes('play')) return { bg: '#00A0D1', icon: 'dw-volume', label: 'Play Message' }; // Blue
  if (t.includes('condition') || t.includes('case')) return { bg: '#F2D075', icon: 'dw-branch', label: 'Decision' }; // Orange/Yellow
  if (t.includes('set') || t.includes('parse')) return { bg: '#A6A6A6', icon: 'dw-settings', label: 'Variable' }; // Grey
  if (t.includes('queue')) return { bg: '#E58A3C', icon: 'dw-queue', label: 'Queue' }; // Dark Orange
  if (t.includes('transfer') || t.includes('hand-off')) return { bg: '#25AB69', icon: 'dw-phone', label: 'Transfer' }; // Green
  if (t.includes('disconnect')) return { bg: '#F47E7E', icon: 'dw-end', label: 'Disconnect' }; // Red
  
  return { bg: '#607D8B', icon: 'dw-file', label: 'Activity' };
};

const WxccNode = ({ data }) => {
  const { nodeType, details } = data;
  const { bg, label } = getCategoryInfo(nodeType);

  // 1. Determine Custom Links (Menu Options)
  let customLinks = [];
  if (details?.menuLinks) {
    details.menuLinks.forEach((linkKey, idx) => {
        const desc = details['menuLinks:input'] ? details['menuLinks:input'][idx] : linkKey;
        customLinks.push({ id: linkKey, digit: linkKey, label: desc });
    });
  } 
  
  // 2. Determine Error/System Links
  // We explicitly check for specific exits often found in WxCC nodes
  const systemLinks = [
    { id: 'timeout', label: 'No-Input Timeout' },
    { id: 'error', label: 'Undefined Error' },
    { id: 'invalid', label: 'Unmatched Entry' },
    { id: 'true', label: 'True' },
    { id: 'false', label: 'False' }
  ];

  // Logic: Does this node utilize these system links? 
  // For standard nodes, we might just want a generic "Next" output if it's not a menu/decision
  const isBranchingNode = customLinks.length > 0 || nodeType.includes('condition') || nodeType.includes('case');

  return (
    <div style={styles.nodeContainer}>
      
      {/* Input Handle (Left) */}
      <Handle type="target" position={Position.Left} style={styles.handleLeft} />

      {/* Header */}
      <div style={styles.header()}>
        <div style={styles.iconBox(bg)}>
            {/* Placeholder for SVG icon */}
            <span>●</span> 
        </div>
        <div style={styles.titleBox}>
            <span style={styles.title} title={data.label}>{data.label}</span>
            <span style={styles.subTitle}>{label}</span>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        
        {/* Section: Custom Links (Digits/Choices) */}
        {customLinks.length > 0 && (
            <>
            <div style={styles.sectionTitle}>Custom Links</div>
            {customLinks.map((link) => (
                <div key={link.id} style={styles.linkRow}>
                    <div style={styles.digitPill}>{link.digit}</div>
                    <div style={styles.descBox} title={link.label}>{link.label}</div>
                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id={link.id} 
                        style={styles.handleRight} 
                    />
                </div>
            ))}
            </>
        )}

        {/* Section: System/Error Links */}
        <div style={{...styles.sectionTitle, marginTop: '10px'}}>Exits / Handling</div>
        
        {/* If it's a simple linear node (like Play Message), just show one 'Done' output */}
        {!isBranchingNode && (
            <div style={styles.linkRow}>
                <div style={styles.descBox}>Next Step</div>
                <Handle type="source" position={Position.Right} id="default" style={styles.handleRight} />
            </div>
        )}

        {/* If it IS branching, show the potential system exits (Timeout, Error, etc) */}
        {/* In a real app, you might filter this list based on whether the node *actually* has these links enabled in JSON */}
        {isBranchingNode && systemLinks.map(link => (
             <div key={link.id} style={{...styles.linkRow, height: '24px'}}>
                <span style={{color: '#777', marginLeft: '10px', fontSize: '11px'}}>{link.label}</span>
                <Handle 
                    type="source" 
                    position={Position.Right} 
                    id={link.id} 
                    style={styles.handleError} 
                />
             </div>
        ))}
      </div>
    </div>
  );
};

export default memo(WxccNode);
