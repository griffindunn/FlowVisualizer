import React from 'react';
import { getNodeConfig } from '../../wxccConfig';
import { commonStyles } from './commonStyles';

import DefaultDetails from './DefaultDetails';
// Note: All other imports are handled dynamically by wxccConfig but must be imported here if you use a switch, 
// OR simpler: have wxccConfig return the component directly, as I set up.

const styles = {
  container: {
    position: 'absolute', top: 20, right: 20, width: '350px',
    background: 'white', borderRadius: '8px', border: '1px solid #ccc',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100,
    fontFamily: '"CiscoSans", sans-serif', maxHeight: '85vh', display: 'flex', flexDirection: 'column'
  },
  header: { padding: '16px', borderBottom: '1px solid #eee', background: '#f9f9f9', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' },
  body: { padding: '16px', overflowY: 'auto', flex: 1 },
  title: { margin: 0, fontSize: '16px', color: '#333', fontWeight: 600 },
  subtitle: { margin: '4px 0 0 0', fontSize: '11px', color: '#888', textTransform: 'uppercase' },
  closeBtn: { position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#999', padding: 0, lineHeight: 1 }
};

const DetailsPanel = ({ node, onClose }) => {
  if (!node) return null;
  const { data } = node;
  const config = getNodeConfig(data.nodeType);
  const SpecificDetails = config.detailComponent || DefaultDetails;

  return (
    <div style={styles.container}>
      <button style={styles.closeBtn} onClick={onClose}>×</button>
      <div style={styles.header}>
        <h3 style={styles.title}>{data.label}</h3>
        <p style={styles.subtitle}>{data.nodeType}</p>
      </div>
      <div style={styles.body}>
         <SpecificDetails details={data.details} />
      </div>
    </div>
  );
};
export default DetailsPanel;
