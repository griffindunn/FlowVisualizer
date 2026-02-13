import React from 'react';
import { commonStyles as s } from './commonStyles';

const DefaultDetails = ({ details }) => (
    <div style={s.section}>
        <div style={s.sectionTitle}>Properties</div>
        {Object.entries(details).map(([k, v]) => {
           if (typeof v === 'object' || k.startsWith('_') || k === 'activityId') return null;
           return (
             <div key={k} style={s.row}>
               <span style={s.label}>{k}</span>
               <span style={s.value}>{String(v)}</span>
             </div>
           );
        })}
    </div>
);
export default DefaultDetails;
