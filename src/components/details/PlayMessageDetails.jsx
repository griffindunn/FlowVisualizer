import React from 'react';
import { commonStyles as s } from './commonStyles';

const PlayMessageDetails = ({ details }) => {
  const prompts = details.promptsTts || details.prompts || [];

  return (
    <>
      <div style={s.section}>
        <div style={s.sectionTitle}>Settings</div>
        <div style={s.row}>
           <span style={s.label}>Interruptible</span>
           <span style={s.value}>{details.interruptible ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Audio Source</div>
        {prompts.map((p, i) => (
           <div key={i} style={{background: '#f0f8ff', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #d1e8ff'}}>
              <div style={{fontSize: '10px', fontWeight: 'bold', color: '#0277BD', marginBottom: '4px'}}>
                 {p.type === 'tts' ? 'TEXT TO SPEECH' : 'AUDIO FILE'}
              </div>
              <div style={{fontSize: '12px', color: '#333'}}>
                 {p.value || p.name}
              </div>
           </div>
        ))}
      </div>
    </>
  );
};

export default PlayMessageDetails;
