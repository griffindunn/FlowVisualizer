import React from 'react';
import { getNodeConfig } from '../../wxccConfig';
import { commonStyles } from './commonStyles';

// Detail Components are imported in wxccConfig, but we need to ensure they are accessible.
// Actually, it's cleaner if wxccConfig returns the Component reference directly.

const styles = {
  container: {
    position: 'absolute', top: 20, right: 20, width: '350px',
    background: 'white', borderRadius: '8px', border: '1px solid #ccc',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100,
    fontFamily: '"CiscoSans", sans-serif', maxHeight: '85vh', display: 'flex', flexDirection: 'column'
  },
  header: { padding: '15px', borderBottom: '1px solid #eee', background: '#f9f9f9', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' },
  body: { padding: '15px', overflowY: 'auto', flex: 1 },
  title: { margin: 0, fontSize: '16px', color: '#333' },
  subtitle: { margin: '4px 0 0 0', fontSize: '11px', color: '#888' },
  closeBtn: { position: 'absolute', top: 10, right: 10, border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer', color: '#999' }
};

const DetailsPanel = ({ node, onClose }) => {
  if (!node) return null;
  const { data } = node;
  const config = getNodeConfig(data.nodeType);
  const SpecificDetails = config.detailComponent;

  return (
    <div style={styles.container}>
      <button style={styles.closeBtn} onClick={onClose}>×</button>
      <div style={styles.header}>
        <h3 style={styles.title}>{data.label}</h3>
        <p style={styles.subtitle}>{data.nodeType}</p>
      </div>
      <div style={styles.body}>
         {SpecificDetails ? (
            <SpecificDetails details={data.details} />
         ) : (
            <div style={{color: '#888', fontStyle: 'italic'}}>No specific detail view for this node type.</div>
         )}
      </div>
    </div>
  );
};

export default DetailsPanel;
