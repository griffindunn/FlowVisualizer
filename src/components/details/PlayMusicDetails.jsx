import React from 'react';
import { commonStyles as s } from './commonStyles';

const PlayMusicDetails = ({ details }) => (
  <>
    <div style={s.section}>
      <div style={s.sectionTitle}>Music Settings</div>
      <div style={s.row}><span style={s.label}>Duration</span><span style={s.value}>{details.duration ? `${details.duration} seconds` : 'Continuous'}</span></div>
      <div style={s.row}><span style={s.label}>Source Type</span><span style={s.value}>{details.audioRadioGroup === 'staticAudio' ? 'Static File' : 'Variable'}</span></div>
    </div>
    <div style={s.section}>
       <div style={s.sectionTitle}>Audio File</div>
       <div style={s.codeBlock}>{details.prompt || details['prompt:name'] || details.musicFile}</div>
    </div>
  </>
);
export default PlayMusicDetails;
