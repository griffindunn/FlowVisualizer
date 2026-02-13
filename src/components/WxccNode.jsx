// src/components/WxccNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// --- Styles ---
const styles = {
  nodeContainer: {
    minWidth: '200px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    border: '1px solid #ccc',
    overflow: 'hidden',
    fontFamily: 'sans-serif',
    fontSize: '12px'
  },
  header: (color) => ({
    background: color,
    padding: '8px',
    color: '#fff',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }),
  body: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  row: {
    display: 'flex',
    justifyContent: 'flex-end', // Align text to right near the handle
    alignItems: 'center',
    position: 'relative',
    height: '20px'
  },
  rowLabel: {
    marginRight: '10px',
    color: '#555'
  },
  // Handle Styles
  handleLeft: { left: '-6px', width: '10px', height: '10px', background: '#555' },
  handleRight: { right: '-6px', width: '10px', height: '10px', background: '#555' }
};

// --- Logic to get Color & Icon based on Type ---
const getCategoryInfo = (type) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('menu')) return { color: '#005073', icon: 'dw-menu', label: 'Menu' }; // Webex Blue
  if (t.includes('play')) return { color: '#0277BD', icon: 'dw-volume', label: 'Play' };
  if (t.includes('condition') || t.includes('case') || t.includes('business')) return { color: '#FFB300', icon: 'dw-branch', label: 'Decision' }; // Amber
  if (t.includes('set') || t.includes('http') || t.includes('parse')) return { color: '#757575', icon: 'dw-settings', label: 'System' };
  if (t.includes('queue')) return { color: '#EF6C00', icon: 'dw-queue', label: 'Queue' };
  if (t.includes('transfer') || t.includes('hand-off')) return { color: '#2E7D32', icon: 'dw-phone', label: 'Transfer' };
  if (t.includes('disconnect')) return { color: '#C62828', icon: 'dw-end', label: 'End' };
  
  return { color: '#607D8B', icon: 'dw-file', label: 'Activity' };
};

const WxccNode = ({ data }) => {
  const { nodeType, details } = data;
  const { color, label } = getCategoryInfo(nodeType);

  // 1. Determine Output Handles
  // If it's a Menu, we grab the "menuLinks" array from properties
  // If it's a Case/Condition, we might grab branches (though WxCC JSON structure varies here)
  let outputs = [];
  
  // A. Menu Outputs
  if (details?.menuLinks) {
    // details.menuLinks is ["1", "2"]
    // details.menuLinks_input is ["Sales", "Support"] (The descriptions)
    details.menuLinks.forEach((linkKey, idx) => {
        const desc = details['menuLinks:input'] ? details['menuLinks:input'][idx] : linkKey;
        outputs.push({ id: linkKey, label: `Option ${linkKey} (${desc})` });
    });
  } 
  
  // B. Standard Error Outputs (Common to almost all WxCC nodes)
  const errors = ['timeout', 'error', 'invalid', 'true', 'false'];
  // We only show these if we detect edges connecting to them later? 
  // For now, let's just add specific ones if likely relevant.
  
  // C. Fallback: If no specific outputs, allow a "default" pass-through
  const hasSpecificOutputs = outputs.length > 0;
  
  return (
    <div style={styles.nodeContainer}>
      {/* --- Global Input Handle (Left) --- */}
      <Handle type="target" position={Position.Left} style={styles.handleLeft} />

      {/* --- Header --- */}
      <div style={styles.header(color)}>
        {/* You can add actual SVG icons here later */}
        <span>{label}</span>
        <span style={{fontWeight: 'normal', fontSize: '10px', opacity: 0.8}}>| {nodeType}</span>
      </div>

      {/* --- Body --- */}
      <div style={styles.body}>
        <strong>{data.label}</strong>
        
        {/* Dynamic Outputs (Right Side) */}
        {hasSpecificOutputs ? (
           outputs.map((out) => (
             <div key={out.id} style={styles.row}>
               <span style={styles.rowLabel}>{out.label}</span>
               <Handle 
                  type="source" 
                  position={Position.Right} 
                  id={out.id} 
                  style={styles.handleRight} 
               />
             </div>
           ))
        ) : (
          /* Standard Default Output */
          <div style={styles.row}>
            <span style={styles.rowLabel}>Next</span>
            <Handle type="source" position={Position.Right} id="default" style={styles.handleRight} />
          </div>
        )}

        {/* Always Render Common "Hidden" Exits (Timeout/Error) if they exist in links */}
        {/* For visual cleanliness, we stack them at bottom */}
        <div style={{borderTop: '1px solid #eee', marginTop: 5, paddingTop: 5}}>
            {['timeout', 'error', 'true', 'false'].map(key => (
                 <div key={key} style={{...styles.row, height: 15}}>
                 <span style={{...styles.rowLabel, fontSize: 9}}>{key}</span>
                 <Handle 
                    type="source" 
                    position={Position.Right} 
                    id={key} 
                    style={{...styles.handleRight, background: '#ccc'}} // Lighter color for system exits
                 />
               </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default memo(WxccNode);
