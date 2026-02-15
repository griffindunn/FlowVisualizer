// src/processWxccJson.js
import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

const EDGE_TYPE = 'curvedLoop'; 
const SPACING_FACTOR_X = 2.2; 
const SPACING_FACTOR_Y = 2.2;

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  let maxMainY = 0;

  const getWidget = (id, currentDiagram) => {
    return currentDiagram?.widgets?.[id];
  };

  const processFlowScope = (flowData, diagramData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const activityList = Object.values(activities);

    activityList.forEach((activity, index) => {
      const widget = getWidget(activity.id, diagramData);
      
      let x = 0;
      let y = 0;

      if (widget?.point) {
        x = widget.point.x * SPACING_FACTOR_X;
        y = widget.point.y * SPACING_FACTOR_Y;
      } else {
        if (isEvent) {
          x = (index % 2 === 0) ? 0 : 400; 
          y = index * 250;
        } else {
          const col = index % 5;
          const row = Math.floor(index / 5);
          x = col * 450;
          y = row * 300;
        }
      }

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

        // Detect Error Paths
        // Note: We deliberately exclude 'timeout' if it's the specific "no-input" type, 
        // but typically 'timeout' is considered an error path in visualizers. 
        // User asked to NOT hide "no-input timeout". 
        // We will mark them as "red" in color, but we will add a data flag 'isHideableError' 
        // so the UI knows which ones to toggle.
        
        const isErrorPath = ['error', 'failure', 'invalid', 'false', 'insufficient_data', 'busy', 'no_answer', 'exception'].includes(sourceHandleId);
        const isTimeout = sourceHandleId === 'timeout'; 

        // Visual Color Logic
        // Timeout is usually red too, but we separate the Z-Index logic
        const isRedLine = isErrorPath || isTimeout;
        const color = isRedLine ? '#D32F2F' : '#555';

        // Z-INDEX LOGIC: Red lines (0) below Black lines (1)
        const zIndex = isRedLine ? 0 : 1;

        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, 
          type: EDGE_TYPE, 
          zIndex: zIndex, // <-- Controlled Z-Index
          markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: color },
          style: { stroke: color, strokeWidth: 2 }, 
          data: { 
            isEventEdge: isEvent,
            isError: isRedLine,
            // Logic for the Toggle: User wants to hide errors, but keep 'timeout' visible.
            isHideable: isErrorPath && !isTimeout // Hide 'error', keep 'timeout'
          }
        });
      });
    }
  };

  if (json.process) {
    processFlowScope(json.process, json.diagram, '', false, 0);
  }

  let eventCursorY = maxMainY + 2000; 

  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      nodes.push({
        id: `header-${eventName}`,
        type: 'groupHeader',
        position: { x: 0, y: eventCursorY - 150 },
        data: { label: `Event: ${eventName}` },
        draggable: false,
      });

      if (eventData.process) {
        processFlowScope(eventData.process, eventData.diagram, `${eventName}-`, true, eventCursorY);
      }
      
      let blockHeight = 500;
      if (eventData.diagram && eventData.diagram.widgets) {
         const yValues = Object.values(eventData.diagram.widgets)
             .map(w => w.point?.y || 0)
             .filter(y => !isNaN(y));
         if (yValues.length > 0) {
             const maxY = Math.max(...yValues);
             blockHeight = (maxY * SPACING_FACTOR_Y) + 500;
         }
      }
      eventCursorY += blockHeight; 
    });
  }

  return { nodes, edges };
};
