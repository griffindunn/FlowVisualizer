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
    overflow: 'visible', // Allow handles to bleed out
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
    borderBottomRightRadius: '8px'
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
  // Handles - adjusted to align centers
  handleLeft: { 
    left: '-5px', // Exact overlapping for cleaner lines
    width: '10px', 
    height: '10px', 
    background: '#555',
    border: '2px solid #fff', // White ring to separate from line
    borderRadius: '50%',
    zIndex: 10
  },
  handleRight: { 
    right: '-5px', 
    width: '10px', 
    height: '10px', 
    background: '#555', 
    border: '2px solid #fff', 
    borderRadius: '50%',
    zIndex: 10
  },
  handleError: {
    right: '-5px', 
    width: '8px', 
    height: '8px', 
    background: '#999', 
    border: '2px solid #fff',
    borderRadius: '50%'
  },
  defaultText: {
    marginRight: '12px',
    color: '#555'
  }
};

// --- Logic: Get Valid Exits per Node Type ---
const getValidExits = (type) => {
  const t = (type || '').toLowerCase();

  // Menus / Collect Digits have timeouts and invalids
  if (t.includes('menu') || t.includes('collect')) {
    return ['timeout', 'invalid', 'error'];
  }
  // Queue has specific queue errors
  if (t.includes('queue')) {
    return ['insufficient_data', 'error'];
  }
  // Data actions just have generic error
  if (t.includes('set') || t.includes('parse') || t.includes('http') || t.includes('bre')) {
    return ['error'];
  }
  // Transfers
  if (t.includes('transfer')) {
    return ['busy', 'no_answer', 'invalid', 'error'];
  }
  
  // Default for everything else
  return ['error'];
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

const WxccNode = ({ data }) => {
  const { nodeType, details } = data;
  const { bg, label } = getCategoryInfo(nodeType);
  const validExits = getValidExits(nodeType);

  const t = (nodeType || '').toLowerCase();
  const isMenu = t.includes('ivr-menu');
  const isCase = t.includes('case');
  const isCondition = t.includes('condition') || t.includes('business-hours');
  
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

  // --- Render Logic ---
  // We need to know which row is the "first" row to place the Input Handle there.
  let isFirstRowRendered = false;

  const RenderRow = ({ label, id, isSystem = false, isPill = false, pillText = '' }) => {
    // Check if this is the very first row being rendered
    const showInputHandle = !isFirstRowRendered;
    if (showInputHandle) isFirstRowRendered = true;

    return (
      <div style={{...styles.linkRow, height: isSystem ? 20 : 28}}>
        {/* --- INPUT HANDLE --- */}
        {/* We place it here so it aligns perfectly vertically with the first output */}
        {showInputHandle && (
            <Handle 
                type="target" 
                position={Position.Left} 
                style={styles.handleLeft} 
            />
        )}

        {isPill && <div style={styles.digitPill}>{pillText}</div>}
        
        {/* For System links, we just show text. For main links, we use the gray box */}
        {isSystem ? (
            <span style={{marginRight: 12, fontSize: 11, color: '#888'}}>{label}</span>
        ) : (
            <div style={styles.descBox} title={label}>{label}</div>
        )}

        <Handle 
            type="source" 
            position={Position.Right} 
            id={id} 
            style={isSystem ? styles.handleError : styles.handleRight} 
        />
      </div>
    );
  };

  return (
    <div style={styles.nodeContainer}>
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.iconBox(bg)}>
            <span>●</span> 
        </div>
        <div style={styles.titleBox}>
            <span style={styles.title} title={data.label}>{data.label}</span>
            <span style={styles.subTitle}>{label}</span>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>

        {/* --- MENU LINKS --- */}
        {isMenu && (
            <>
            {menuLinks.length > 0 && <div style={styles.sectionTitle}>Custom Links</div>}
            {menuLinks.map((link) => (
                <RenderRow key={link.id} id={link.id} label={link.label} isPill={true} pillText={link.digit} />
            ))}
            </>
        )}

        {/* --- CASE / CONDITION LINKS --- */}
        {(isCase || isCondition) && (
            <>
            {caseLinks.length > 0 && <div style={styles.sectionTitle}>Case</div>}
            {caseLinks.map((link) => (
                <RenderRow key={link.id} id={link.id} label={link.label} />
            ))}
            
            {/* Default Row */}
            <RenderRow id="default" label="Default" />
            <Handle type="source" position={Position.Right} id="0" style={{opacity: 0}} />
            </>
        )}

        {/* --- STANDARD LINEAR OUTPUT --- */}
        {/* Used for Play, Set Var, etc. */}
        {!isMenu && !isCase && !isCondition && (
             <RenderRow id="default" label="Success" />
        )}

        {/* --- ERROR HANDLING --- */}
        {/* No Title, just the specific exits */}
        <div style={{borderTop: '1px solid #f0f0f0', marginTop: 5, paddingTop: 5}}>
            {validExits.map(key => (
                 <RenderRow key={key} id={key} label={key === 'error' ? 'Undefined Error' : key} isSystem={true} />
            ))}
        </div>

      </div>
    </div>
  );
};

export default memo(WxccNode);
