// src/processWxccJson.js
import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

const EDGE_TYPE = 'curvedLoop'; 

// Scaling factors to spread out the Cisco coordinates slightly for React Flow
const SPACING_FACTOR_X = 2.2; 
const SPACING_FACTOR_Y = 2.2;

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  
  // We track the max Y of the main flow to know where to start placing events
  let maxMainY = 0;

  const processFlowScope = (flowData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const widgets = flowData.diagram?.widgets || json.diagram?.widgets || {}; 

    Object.values(activities).forEach((activity, index) => {
      const widget = widgets[activity.id];
      let x = 0;
      let y = 0;

      // 1. Use Real Coordinates if available (Preferred)
      if (widget?.point) {
        x = widget.point.x * SPACING_FACTOR_X;
        y = widget.point.y * SPACING_FACTOR_Y;
      } else {
        // Fallback if JSON has no diagram data
        const row = Math.floor(index / 5);
        const col = index % 5;
        x = col * 450; 
        y = row * 300;
      }

      // Apply Offset (pushes events down below main flow)
      y = y + startYOffset;

      if (!isEvent && y > maxMainY) maxMainY = y;

      const rawType = activity.properties?.activityName || activity.activityName || 'unknown';
      const config = getNodeConfig(rawType);
      const nodeType = config.nodeType || 'DefaultNode';

      nodes.push({
        id: `${prefix}${activity.id}`,
        type: nodeType, 
        position: { x, y },
        data: {
          label: activity.name,
          nodeType: rawType,
          details: activity.properties,    
          isEventNode: isEvent             
        },
        zIndex: 10 
      });
    });

    if (links) {
      links.forEach((link) => {
        let sourceHandleId = link.conditionExpr;
        if (!sourceHandleId || sourceHandleId === '' || sourceHandleId === 'true' || sourceHandleId === 'out' || sourceHandleId === 'success') {
             sourceHandleId = 'default';
        }

        let isErrorPath = ['error', 'timeout', 'invalid', 'false', 'failure', 'insufficient_data', 'busy', 'no_answer'].includes(sourceHandleId);
        if (sourceHandleId === 'default') isErrorPath = false;

        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, 
          type: EDGE_TYPE, 
          zIndex: 20, 
          markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: isErrorPath ? '#D32F2F' : '#555' },
          style: { stroke: isErrorPath ? '#D32F2F' : '#555', strokeWidth: 2 }, 
          data: { isEventEdge: isEvent }
        });
      });
    }
  };

  // 1. Process Main Flow
  if (json.process) {
    processFlowScope(json.process, '', false, 0);
  }

  // 2. Process Event Flows (Offset by the height of main flow + padding)
  let eventCursorY = maxMainY + 1500; // Start events way below main flow

  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      // Add Header
      nodes.push({
        id: `header-${eventName}`,
        type: 'groupHeader',
        position: { x: 0, y: eventCursorY - 200 },
        data: { label: `Event: ${eventName}` },
        draggable: false,
      });

      if (eventData.process) {
        // Pass the cursor as the startYOffset
        processFlowScope(eventData.process, `${eventName}-`, true, eventCursorY);
      }
      // Add roughly 2000px height for next event block (simple heuristic)
      eventCursorY += 2500; 
    });
  }

  return { nodes, edges };
};
