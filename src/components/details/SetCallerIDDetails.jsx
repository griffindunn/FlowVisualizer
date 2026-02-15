import React from 'react';

const SetCallerIDDetails = ({ data }) => {
  const details = data.details || {};

  // Extract the value (Static number or Variable)
  const callerIdValue = details.callerId || details.callerId_name || 'Not Configured';
  const mode = details.callerId_radioName === 'staticCallerId' ? 'Static Value' : 'Variable';

  return (
    <div style={{ padding: '15px' }}>
      <h3 style={{ 
        borderBottom: '1px solid #ddd', 
        paddingBottom: '10px', 
        marginBottom: '15px', 
        color: '#005073',
        fontSize: '16px'
      }}>
        Set Caller ID
      </h3>

      {/* CALLER ID VALUE */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: '#666', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>
          Configured ID
        </label>
        <div style={{ 
          background: '#E1F5FE', 
          border: '1px solid #B3E5FC', 
          borderRadius: '4px', 
          padding: '10px', 
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '14px',
          color: '#0277BD',
          wordBreak: 'break-all'
        }}>
          {callerIdValue}
        </div>
        <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>
          Type: {mode}
        </div>
      </div>

      {/* DESCRIPTION */}
      {details.description && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#666', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>
            Description
          </label>
          <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
            {details.description}
          </div>
        </div>
      )}

      {/* RAW DATA (Optional debug view) */}
      <div style={{ marginTop: '30px', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
        <div style={{ fontSize: '10px', color: '#aaa' }}>Node ID: {data.id}</div>
      </div>
    </div>
  );
};

export default SetCallerIDDetails;
