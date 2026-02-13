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
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
    fontFamily: '"CiscoSans", sans-serif',
    fontSize: '13px',
    position: 'relative'
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #eee',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
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
    background: '#fafafa'
  },
  // Row for Links
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', // Right align
    position: 'relative',
    height: '28px',
    marginBottom: '2px'
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
    fontSize: '11px'
  },
  // The description gray box
  descBox: {
    background: '#e6e6e6',
    borderRadius: '4px',
    padding: '4px 10px',
    flexGrow: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#555',
    marginRight: '12px', // Gap for handle
    textAlign: 'left',
    fontSize: '12px'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginTop: '6px',
    marginBottom: '4px',
    paddingLeft: '2px'
  },
  // Handles - adjusted to remove gaps
  handleLeft: { 
    left: '-6px', 
    width: '10px', 
    height: '10px', 
    background: '#555',
    border: 'none', // Removed border to ensure line touches
    borderRadius: '50%'
  },
  handleRight: { 
    right: '-6px', 
    width: '10px', 
    height: '10px', 
    background: '#555', 
    border: 'none', 
    borderRadius: '50%'
  },
  handleError: {
    right: '-6px', 
    width: '8px', 
    height: '8px', 
    background: '#999', 
    border: 'none',
    borderRadius: '50%'
  },
  defaultText: {
    marginRight: '12px',
    color: '#555'
  }
};

// --- Webex Specific Labels & Colors ---
const getNodeInfo = (type) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('ivr-menu') || t.includes('menu')) return { bg: '#F2D075', label: 'Menu' };
  if (t.includes('play-message') || t.includes('play')) return { bg: '#00A0D1', label: 'Play Message' };
  if (t.includes('collect-digits')) return { bg: '#00A0D1', label: 'Collect Digits' };
  
  if (t.includes('case')) return { bg: '#F2D075', label: 'Case' };
  if (t.includes('condition')) return { bg: '#F2D075', label: 'Condition' };
  if (t.includes('business-hours')) return { bg: '#F2D075', label: 'Business Hours' };

  if (t.includes('set-variable')) return { bg: '#A6A6A6', label: 'Set Variable' };
  if (t.includes('parse')) return { bg: '#A6A6A6', label: 'Parse' };
  if (t.includes('http')) return { bg: '#A6A6A6', label: 'HTTP Request' };
  if (t.includes('bre')) return { bg: '#A6A6A6', label: 'BRE Request' };
  
  if (t.includes('queue')) return { bg: '#E58A3C', label: 'Queue Contact' };
  if (t.includes('blind-transfer')) return { bg: '#25AB69', label: 'Blind Transfer' };
  if (t.includes('hand-off') || t.includes('subflow')) return { bg: '#7B1FA2', label: 'Subflow / Handoff' };
  if (t.includes('disconnect')) return { bg: '#F47E7E', label: 'Disconnect' };
  
  return { bg: '#607D8B', label: t }; // Fallback shows raw type
};

const WxccNode = ({ data }) => {
  const { nodeType, details } = data;
  const { bg, label } = getNodeInfo(nodeType);

  const t = (nodeType || '').toLowerCase();
  const isMenu = t.includes('ivr-menu');
  const isCase = t.includes('case');
  const isCondition = t.includes('condition') || t.includes('business-hours'); // often treated like case
  
  // 1. Calculate Menu Options
  let menuLinks = [];
  if (isMenu && details?.menuLinks) {
    details.menuLinks.forEach((linkKey, idx) => {
        const desc = details['menuLinks:input'] ? details['menuLinks:input'][idx] : linkKey;
        menuLinks.push({ id: linkKey, digit: linkKey, label: desc });
    });
  }

  // 2. Calculate Case Options
  let caseLinks = [];
  if (isCase && details?.menuLinks) {
      // In WxCC JSON, cases are often stored in 'menuLinks' just like menus
      details.menuLinks.forEach((linkKey, idx) => {
        const desc = details['menuLinks:input'] ? details['menuLinks:input'][idx] : linkKey;
        // Don't show "0" or "default" in the main list, we handle it separately
        if (linkKey !== '0' && linkKey !== 'default') {
            caseLinks.push({ id: linkKey, label: desc || linkKey });
        }
    });
  }

  return (
    <div style={styles.nodeContainer}>
      
      {/* Global Input Handle (Left) */}
      <Handle type="target" position={Position.Left} style={styles.handleLeft} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.iconBox(bg)}>
            {/* SVG Icons could go here */}
            <span>●</span> 
        </div>
        <div style={styles.titleBox}>
            <span style={styles.title} title={data.label}>{data.label}</span>
            <span style={styles.subTitle}>{label}</span>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>

        {/* --- MENU NODE LAYOUT --- */}
        {isMenu && (
            <>
            {menuLinks.length > 0 && <div style={styles.sectionTitle}>Custom Links</div>}
            {menuLinks.map((link) => (
                <div key={link.id} style={styles.linkRow}>
                    <div style={styles.digitPill}>{link.digit}</div>
                    <div style={styles.descBox} title={link.label}>{link.label}</div>
                    <Handle type="source" position={Position.Right} id={link.id} style={styles.handleRight} />
                </div>
            ))}
            </>
        )}

        {/* --- CASE / CONDITION NODE LAYOUT --- */}
        {(isCase || isCondition) && (
            <>
            {caseLinks.length > 0 && <div style={styles.sectionTitle}>Case</div>}
            {caseLinks.map((link) => (
                <div key={link.id} style={styles.linkRow}>
                     {/* Case usually doesn't have a digit pill, just the condition label */}
                    <div style={styles.descBox} title={link.label}>{link.label}</div>
                    <Handle type="source" position={Position.Right} id={link.id} style={styles.handleRight} />
                </div>
            ))}
            
            {/* Explicit Default for Case/Condition */}
            <div style={styles.linkRow}>
                <span style={styles.defaultText}>Default</span>
                <Handle type="source" position={Position.Right} id="default" style={styles.handleRight} />
                {/* Fallback ID for '0' often used as default in WxCC */}
                <Handle type="source" position={Position.Right} id="0" style={{...styles.handleRight, opacity: 0}} />
            </div>
            </>
        )}

        {/* --- STANDARD LINEAR NODE LAYOUT (Play, Set Var, etc) --- */}
        {/* Only show 'Success' output, no label, aligned to top-right of body roughly */}
        {!isMenu && !isCase && !isCondition && (
             <div style={{...styles.linkRow, justifyContent: 'flex-end', height: '10px'}}>
                <Handle type="source" position={Position.Right} id="default" style={styles.handleRight} />
             </div>
        )}

        {/* --- GLOBAL ERROR HANDLING (Bottom Section) --- */}
        <div style={{borderTop: '1px solid #f0f0f0', marginTop: 5, paddingTop: 5}}>
            <div style={styles.sectionTitle}>Error Handling</div>
            
            {/* Common WxCC Errors */}
            {['timeout', 'error', 'invalid', 'failure'].map(key => (
                 <div key={key} style={{...styles.linkRow, height: 20}}>
                 <span style={{marginRight: 12, fontSize: 11, color: '#888'}}>{key === 'error' ? 'Undefined Error' : key}</span>
                 <Handle 
                    type="source" 
                    position={Position.Right} 
                    id={key} 
                    style={styles.handleError} 
                 />
               </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default memo(WxccNode);
