import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const getStyle = (type) => {
  const t = (type || '').toLowerCase();
  if (['ivr-menu', 'play-message', 'collect-digits', 'ivr-collectdigits', 'play-music'].includes(t)) {
    return { bg: '#E1F5FE', border: '#0277BD', icon: '🗣️' };
  }
  if (['condition-activity', 'case-statement', 'business-hours'].includes(t)) {
    return { bg: '#FFF9C4', border: '#FBC02D', icon: '🔀' };
  }
  if (['set-variable', 'http-request-v2', 'parse-activity', 'bre-request', 'fn-activity', 'queue-lookup'].includes(t)) {
    return { bg: '#F5F5F5', border: '#9E9E9E', icon: '⚙️' };
  }
  if (['blind-transfer', 'hand-off'].includes(t)) {
    return { bg: '#E8F5E9', border: '#2E7D32', icon: '📞' };
  }
  if (['queue-contact'].includes(t)) {
    return { bg: '#FFE0B2', border: '#EF6C00', icon: '👥' };
  }
  if (['disconnect-contact'].includes(t)) {
    return { bg: '#FFEBEE', border: '#C62828', icon: '🛑' };
  }
  if (['subflow-handoff'].includes(t)) {
    return { bg: '#F3E5F5', border: '#7B1FA2', icon: '📦' };
  }
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
      <div style={{ fontSize: '9px', color: '#888' }}>{data.nodeType}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: 8, height: 8 }} />
    </div>
  );
};

export default memo(WxccNode);
