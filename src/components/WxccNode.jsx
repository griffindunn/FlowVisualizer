import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const getStyle = (type) => {
  const t = (type || '').toLowerCase();

  // 1. Interaction (Blue)
  if (t.includes('menu') || t.includes('play') || t.includes('collect')) {
    return { bg: '#E1F5FE', border: '#0277BD', icon: '🗣️' };
  }
  // 2. Logic (Yellow)
  if (t.includes('condition') || t.includes('case') || t.includes('business')) {
    return { bg: '#FFF9C4', border: '#FBC02D', icon: '🔀' };
  }
  // 3. Data/System (Grey)
  if (t.includes('set') || t.includes('http') || t.includes('parse') || t.includes('bre') || t.includes('fn') || t.includes('queue-lookup')) {
    return { bg: '#F5F5F5', border: '#9E9E9E', icon: '⚙️' };
  }
  // 4. Routing - Success (Green)
  if (t.includes('transfer') || t.includes('hand-off')) {
    return { bg: '#E8F5E9', border: '#2E7D32', icon: '📞' };
  }
  // 5. Routing - Queue (Orange)
  if (t.includes('queue-contact')) {
    return { bg: '#FFE0B2', border: '#EF6C00', icon: '👥' };
  }
  // 6. Routing - End (Red)
  if (t.includes('disconnect')) {
    return { bg: '#FFEBEE', border: '#C62828', icon: '🛑' };
  }
  // 7. Subflow (Purple)
  if (t.includes('subflow')) {
    return { bg: '#F3E5F5', border: '#7B1FA2', icon: '📦' };
  }

  // Default fallback
  return { bg: '#fff', border: '#000', icon: '📄' };
};

const WxccNode = ({ data }) => {
  const style = getStyle(data.nodeType);
  
  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: '6px',
      padding: '8px',
      minWidth: '140px',
      fontSize: '12px',
      textAlign: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555', width: 8, height: 8 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px' }}>{style.icon}</span>
        <span style={{ fontWeight: 'bold' }}>{data.label}</span>
      </div>

      {/* Debug Line: This helps us see what type the node thinks it is */}
      <div style={{ fontSize: '9px', color: '#888' }}>{data.nodeType || 'Unknown Type'}</div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: 8, height: 8 }} />
    </div>
  );
};

export default memo(WxccNode);
