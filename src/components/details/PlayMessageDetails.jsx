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
           <div key={i} style={s.codeBlock}>
              <div style={{fontSize: '10px', fontWeight: 'bold', color: '#0277BD'}}>{p.type === 'tts' ? 'TTS' : 'AUDIO'}</div>
              {p.value || p.name}
           </div>
        ))}
      </div>
    </>
  );
};
export default PlayMessageDetails;
