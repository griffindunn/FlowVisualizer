// src/processWxccJson.js
import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

// CHANGE: Use the new custom edge type registered in MainFlow
const EDGE_TYPE = 'curvedLoop'; 

const SPACING_FACTOR_X = 2.0; 
const SPACING_FACTOR_Y = 1.5;

export const transformWxccJson = (json) => {
  // ... (Keep existing code exactly the same) ...
  // ... (Inside the links loop) ...

        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, 
          type: EDGE_TYPE, // Now 'curvedLoop'
          zIndex: 20, 
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: isErrorPath ? '#D32F2F' : '#555',
          },
          style: { 
            stroke: isErrorPath ? '#D32F2F' : '#555', 
            strokeWidth: 2 
          }, 
          data: { isEventEdge: isEvent }
        });
      // ...
};
