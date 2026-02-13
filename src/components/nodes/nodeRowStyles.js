export const nodeRowStyles = {
  // The row container: strictly relative so the handle stays inside IT
  container: {
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'flex-end',
    height: '24px', 
    paddingRight: '12px', 
    marginBottom: '4px', 
    position: 'relative', // Critical for handle positioning
    width: '100%'
  },
  // Error container: same strict positioning
  errorContainer: {
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'flex-end',
    height: '24px', 
    paddingRight: '12px',
    position: 'relative',
    width: '100%',
    marginTop: '2px'
  },
  sectionTitle: {
    fontSize: '10px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase',
    padding: '4px 0 4px 12px'
  },
  pill: {
    background: '#fff', border: '1px solid #ccc', borderRadius: '12px',
    padding: '1px 6px', fontSize: '10px', fontWeight: 'bold', color: '#555', marginRight: '8px'
  },
  box: {
    background: '#eee', borderRadius: '4px', padding: '2px 8px',
    fontSize: '12px', color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    maxWidth: '160px'
  },
  successLabel: { fontSize: '12px', fontWeight: 500, color: '#444' },
  errorLabel: { fontSize: '10px', color: '#999' },
  divider: { height: '1px', background: '#eee', margin: '6px 0' },
  
  // Handles: Strictly centered vertically within the 24px row
  handleRight: { 
    right: '-6px', width: '10px', height: '10px', background: '#555', 
    border: '2px solid #fff', borderRadius: '50%', zIndex: 10,
    top: '50%', transform: 'translateY(-50%)' // Centers it perfectly
  },
  handleError: { 
    right: '-6px', width: '8px', height: '8px', background: '#d32f2f', 
    border: '2px solid #fff', borderRadius: '50%', zIndex: 10,
    top: '50%', transform: 'translateY(-50%)'
  }
};
