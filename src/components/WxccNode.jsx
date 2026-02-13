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
    overflow: 'visible', // Must be visible for handles to sit outside
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
    gap: '12px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px'
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
    background: '#fafafa',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    position: 'relative' // Needed for relative handle positioning
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', // Pushes everything to the right
    position: 'relative',
    height: '28px',
    marginBottom: '2px'
  },
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
  descBox: {
    background: '#e6e6e6',
    borderRadius: '4px',
    padding: '4px 10px',
    flexGrow: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#555',
    marginRight: '12px', 
    textAlign: 'left',
    fontSize: '12px'
  },
  // Handles
  handleLeft: { 
    position: 'absolute',
    top: '24px', // Aligns roughly with the first row in the body
    left: '-5px', 
    width: '10px', 
    height: '10px', 
    background: '#555',
    border: '2px solid #fff',
    borderRadius: '50%',
    zIndex: 50 // Ensure it's clickable
  },
  handleRight: { 
    right: '-5px', 
    width: '10px', 
    height: '10px', 
    background: '#555', 
    border: '2px solid #fff', 
    borderRadius: '50%',
    zIndex: 50
  },
  handleError: {
    right: '-5px', 
    width: '8px', 
    height: '8px', 
    background: '#999', 
    border: '2px solid #fff',
    borderRadius: '50%',
    zIndex: 50
  },
  // New style for Success label
  successLabel: {
    marginRight: '12px',
    color: '#555',
    fontSize: '12px',
    fontWeight: 500
  }
};

const getCategoryInfo = (type) => {
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
  
  return { bg: '#607D8B', label: t };
};

// Define valid exits to avoid showing unnecessary handles
const getValidExits = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('menu') || t.includes('collect')) return ['timeout', 'invalid', 'error'];
  if (t.includes('queue')) return ['insufficient_data', 'error'];
  if (t.includes('transfer')) return ['busy', 'no_answer', 'invalid', 'error'];
  if (t.includes('disconnect')) return []; // Disconnect has no exits
  return ['error']; // Default error handler for most nodes
};

const WxccNode = ({ data }) => {
  const { nodeType, details } = data;
  const { bg, label } = getCategoryInfo(nodeType);
  const validExits = getValidExits(nodeType);

  const t = (nodeType || '').toLowerCase();
  const isMenu = t.includes('ivr-menu');
  const isCase = t.includes('case');
  const isCondition = t.includes('condition') || t.includes('business-hours');
  const isDisconnect = t.includes('disconnect');
  
  let menuLinks = [];
  if (isMenu && details?.menuLinks) {
    details.menuLinks.forEach((linkKey, idx) => {
        const desc = details['menuLinks:input'] ? details['menuLinks:input'][idx] : linkKey;
        menuLinks.push({ id: linkKey, digit: linkKey, label: desc });
    });
  }

  let caseLinks = [];
  if (isCase && details?.menuLinks) {
      details.menuLinks.forEach((linkKey, idx) => {
        const desc = details['menuLinks:input'] ? details['menuLinks:input'][idx] : linkKey;
        if (linkKey !== '0' && linkKey !== 'default') {
            caseLinks.push({ id: linkKey, label: desc || linkKey });
        }
    });
  }

  return (
    <div style={styles.nodeContainer}>
      
      {/* Global Input Handle (Left)
        Positioned relative to body to align with top exit of neighbor
      */}
      <div style={{position: 'absolute', top: 70, left: 0, width: '100%'}}>
        <Handle type="target" position={Position.Left} style={styles.handleLeft} />
      </div>

      <div style={styles.header}>
        <div style={styles.iconBox(bg)}><span>●</span></div>
        <div style={styles.titleBox}>
            <span style={styles.title} title={data.label}>{data.label}</span>
            <span style={styles.subTitle}>{label}</span>
        </div>
      </div>

      <div style={styles.body}>

        {/* --- MENU LINKS --- */}
        {isMenu && menuLinks.map((link) => (
            <div key={link.id} style={styles.linkRow}>
                <div style={styles.digitPill}>{link.digit}</div>
                <div style={styles.descBox} title={link.label}>{link.label}</div>
                <Handle type="source" position={Position.Right} id={link.id} style={styles.handleRight} />
            </div>
        ))}

        {/* --- CASE / CONDITION LINKS --- */}
        {(isCase || isCondition) && (
            <>
            {caseLinks.map((link) => (
                <div key={link.id} style={styles.linkRow}>
                    <div style={styles.descBox} title={link.label}>{link.label}</div>
                    <Handle type="source" position={Position.Right} id={link.id} style={styles.handleRight} />
                </div>
            ))}
            <div style={styles.linkRow}>
                <div style={styles.descBox}>Default</div>
                <Handle type="source" position={Position.Right} id="default" style={styles.handleRight} />
                {/* Fallback for '0' */}
                <Handle type="source" position={Position.Right} id="0" style={{opacity: 0, right: '-5px'}} />
            </div>
            </>
        )}

        {/* --- STANDARD SUCCESS OUTPUT --- */}
        {/* Only rendered if NOT a branching node and NOT a disconnect node */}
        {!isMenu && !isCase && !isCondition && !isDisconnect && (
             <div style={styles.linkRow}>
                <span style={styles.successLabel}>Success</span>
                <Handle type="source" position={Position.Right} id="default" style={styles.handleRight} />
             </div>
        )}

        {/* --- ERROR HANDLING --- */}
        {!isDisconnect && validExits.length > 0 && (
            <div style={{borderTop: '1px solid #f0f0f0', marginTop: 5, paddingTop: 5}}>
                {validExits.map(key => (
                    <div key={key} style={{...styles.linkRow, height: 20}}>
                    <span style={{marginRight: 12, fontSize: 11, color: '#999'}}>{key === 'error' ? 'Undefined Error' : key}</span>
                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id={key} 
                        style={styles.handleError} 
                    />
                </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};

export default memo(WxccNode);
