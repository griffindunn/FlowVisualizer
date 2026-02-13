import React from 'react';
import { commonStyles as s } from './commonStyles';

const MenuDetails = ({ details }) => (
  <>
    {details.promptsTts && (
      <div style={s.section}>
        <div style={s.sectionTitle}>Prompt</div>
        {details.promptsTts.map((p, i) => (
           <div key={i} style={s.codeBlock}>
             <div style={{color:'#0277BD', fontWeight:'bold', fontSize:'10px'}}>{p.type === 'tts' ? 'TTS' : 'AUDIO'}</div>
             {p.value || p.name}
           </div>
        ))}
      </div>
    )}
    <div style={s.section}>
      <div style={s.sectionTitle}>Settings</div>
      <div style={s.row}><span style={s.label}>Input Timeout</span><span style={s.value}>{details.entryTimeout}s</span></div>
      <div style={s.row}><span style={s.label}>Interruptible</span><span style={s.value}>{details.interruptible ? 'Yes' : 'No'}</span></div>
    </div>
  </>
);
export default MenuDetails;
