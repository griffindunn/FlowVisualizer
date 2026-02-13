// src/components/WxccNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const styles = {
  nodeContainer: {
    minWidth: '250px',
    maxWidth: '350px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #e0e0e0',
    overflow: 'visible',
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
    color: '#fff',
    flexShrink: 0,
    fontSize: '14px'
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
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', 
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
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginTop: '6px',
    marginBottom: '4px',
    paddingLeft: '2px'
  },
  handleLeft: { 
    left: '-6px', 
    width: '10px', 
    height: '10px', 
    background: '#555',
    border: '2px solid #fff',
    borderRadius: '50%',
    zIndex: 50,
    position: 'absolute',
    top: '50%', // Centers vertically within the ROW
    transform: 'translateY(-50%)'
  },
  handleRight: { 
    right: '-6px', 
    width: '10px', 
    height: '10px', 
    background: '#555', 
    border: '2px solid #fff', 
    borderRadius: '50%',
    zIndex: 50
  },
  handleError: {
    right: '-6px', 
    width: '8px', 
    height: '8px', 
    background: '#999', 
    border: '2px solid #fff',
    borderRadius: '50%',
    zIndex: 50
  },
  successLabel: {
    marginRight: '12px',
    color: '#555',
    fontSize: '12px',
    fontWeight: 500
  }
};

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
  if (t.includes('start') || t.includes('newphone')) return { bg: '#25AB69', label: 'Start' };
  
  return { bg: '#607D8B', label: type }; 
};

// Define valid exits to avoid showing unnecessary handles
const getValidExits = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('menu') || t.includes('collect')) return ['timeout', 'invalid', 'error'];
  if (t.includes('queue')) return ['insufficient_data', 'error'];
  if (t.includes('transfer')) return ['busy', 'no_answer', 'invalid', 'error'];
  if (t.includes('disconnect')) return []; 
  return ['error']; // Default error handler
};

const WxccNode = ({ data }) => {
  const { nodeType, details } = data;
  const { bg, label } = getNodeInfo(nodeType);
  const validExits = getValidExits(nodeType);

  const t = (nodeType || '').toLowerCase();
  const isMenu = t.includes('ivr-menu');
  const isCase = t.includes('case');
  const isCondition = t.includes('condition') || t.includes('business-hours');
  
  const isStart = t.includes('start') || t.includes('newphone');
  const isEnd = t.includes('disconnect') || t.includes('blind-transfer') || t.includes('hand-off');

  // Menu Links
  let menuLinks = [];
  if (isMenu && details?.menuLinks) {
    details.menuLinks.forEach((linkKey, idx) => {
        const desc = details['menuLinks:input'] ? details['menuLinks:input'][idx] : linkKey;
        menuLinks.push({ id: linkKey, digit: linkKey, label: desc });
    });
  }

  // Case Links
  let caseLinks = [];
  if (isCase && details?.menuLinks) {
      details.menuLinks.forEach((linkKey, idx) => {
        const desc = details['menuLinks:input'] ? details['menuLinks:input'][idx] : linkKey;
        if (linkKey !== '0' && linkKey !== 'default') {
            caseLinks.push({ id: linkKey, label: desc || linkKey });
        }
    });
  }

  // Logic to ensure the Input Handle appears exactly once, aligned with the top exit row
  let inputRendered = false;

  const RowWithInput = ({ children }) => {
    const shouldRenderInput = !isStart && !inputRendered;
    if (shouldRenderInput) inputRendered = true;

    return (
      <>
        {shouldRenderInput && <Handle type="target" position={Position.Left} style={styles.handleLeft} />}
        {children}
      </>
    );
  };

  return (
    <div style={styles.nodeContainer}>
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
                <RowWithInput />
                <div style={styles.digitPill}>{link.digit}</div>
                <div style={styles.descBox} title={link.label}>{link.label}</div>
                <Handle type="source" position={Position.Right} id={link.id} style={styles.handleRight} />
            </div>
        ))}

        {/* --- CASE LINKS --- */}
        {(isCase || isCondition) && (
            <>
            {caseLinks.map((link) => (
                <div key={link.id} style={styles.linkRow}>
                    <RowWithInput />
                    <div style={styles.descBox} title={link.label}>{link.label}</div>
                    <Handle type="source" position={Position.Right} id={link.id} style={styles.handleRight} />
                </div>
            ))}
            <div style={styles.linkRow}>
                <RowWithInput />
                <div style={styles.descBox}>Default</div>
                <Handle type="source" position={Position.Right} id="default" style={styles.handleRight} />
                <Handle type="source" position={Position.Right} id="0" style={{opacity: 0, right: '-5px'}} />
            </div>
            </>
        )}

        {/* --- STANDARD SUCCESS OUTPUT --- */}
        {/* Only rendered if NOT branching and NOT an End node */}
        {!isMenu && !isCase && !isCondition && !isEnd && (
             <div style={styles.linkRow}>
                <RowWithInput />
                <span style={styles.successLabel}>Success</span>
                <Handle type="source" position={Position.Right} id="default" style={styles.handleRight} />
             </div>
        )}

        {/* --- ERROR HANDLING --- */}
        {validExits.length > 0 && (
            <div style={{borderTop: '1px solid #f0f0f0', marginTop: 5, paddingTop: 5}}>
                {validExits.map(key => (
                    <div key={key} style={{...styles.linkRow, height: 20}}>
                    {/* If this node had NO success outputs (like Disconnect), Input must go here */}
                    <RowWithInput />
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

        {/* --- CATCH-ALL INPUT --- */}
        {/* If node is not Start, but has NO exits at all (rare disconnect with no error), we still need an input handle */}
        {!isStart && !inputRendered && (
             <div style={{position: 'absolute', top: 15, left: 0}}>
                <Handle type="target" position={Position.Left} style={styles.handleLeft} />
             </div>
        )}

      </div>
    </div>
  );
};

export default memo(WxccNode);
