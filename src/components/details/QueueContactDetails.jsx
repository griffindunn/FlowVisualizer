import React from 'react';
import { commonStyles as s } from './commonStyles';

const QueueContactDetails = ({ details }) => {
  // Logic: Is it using a Static ID or a Variable?
  const isStatic = details.queueRadioGroup === 'staticQueue';
  const isSkillBased = details['destination:type'] === 'SKILLS_BASED';

  return (
    <>
      <div style={s.section}>
        <div style={s.sectionTitle}>Queue Selection</div>
        <div style={s.row}>
           <span style={s.label}>Method</span>
           <span style={s.value}>{isStatic ? 'Static Queue' : 'Variable'}</span>
        </div>
        
        {isStatic ? (
          <div style={s.row}>
            <span style={s.label}>Queue Name</span>
            <span style={s.value}>{details['destination:name'] || details.destination}</span>
          </div>
        ) : (
          <div style={s.row}>
            <span style={s.label}>Queue Variable</span>
            <span style={s.value}>{details.destinationVariable || details.destination}</span>
          </div>
        )}
      </div>

      {isSkillBased && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Skill Requirements</div>
          {details.skills ? (
             <div style={s.codeBlock}>{JSON.stringify(details.skills, null, 2)}</div>
          ) : (
             <div style={{color: '#999', fontSize: '12px'}}>No specific skills defined.</div>
          )}
        </div>
      )}
    </>
  );
};

export default QueueContactDetails;
