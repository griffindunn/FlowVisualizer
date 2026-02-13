import React from 'react';
import { commonStyles as s } from './commonStyles';

const QueueContactDetails = ({ details }) => {
  const isStatic = details.queueRadioGroup === 'staticQueue';
  const isSkillBased = details['destination:type'] === 'SKILLS_BASED';

  return (
    <>
      <div style={s.section}>
        <div style={s.sectionTitle}>Queue Selection</div>
        <div style={s.row}><span style={s.label}>Method</span><span style={s.value}>{isStatic ? 'Static Queue' : 'Variable'}</span></div>
        <div style={s.row}><span style={s.label}>Target</span><span style={s.value}>{details['destination:name'] || details.destination || details.destinationVariable}</span></div>
      </div>
      {isSkillBased && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Skill Requirements</div>
          <div style={s.codeBlock}>{JSON.stringify(details.skills, null, 2)}</div>
        </div>
      )}
    </>
  );
};
export default QueueContactDetails;
