// src/processWxccJson.js
import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

const EDGE_TYPE = 'curvedLoop'; 
const SPACING_FACTOR_X = 2.2; 
const SPACING_FACTOR_Y = 2.2;

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  
  // Track max Y of main flow to know where to safely push events
  let maxMainY = 0;

  // Helper to safely extract widgets from various places in the JSON structure
  const getWidget = (id, localWidgets, globalWidgets) => {
    return localWidgets?.[id] || globalWidgets?.[id];
  };

  const processFlowScope = (flowData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const localWidgets = flowData.diagram?.widgets || {};
    const globalWidgets = json.diagram?.widgets || {};

    const activityList = Object.values(activities);

    activityList.forEach((activity, index) => {
      const widget = getWidget(activity.id, localWidgets, globalWidgets);
      
      let x = 0;
      let y = 0;

      if (widget?.point) {
        // CASE A: We have real coordinates from Cisco
        x = widget.point.x * SPACING_FACTOR_X;
        y = widget.point.y * SPACING_FACTOR_Y;
      } else {
        // CASE B: Fallback (Missing Coordinates)
        // Previous bug: "Mashed 5x5 grid". 
        // Fix: Use a vertical stack with zig-zag to avoid overlap
        if (isEvent) {
          x = (index % 2 === 0) ? 0 : 400; // Alternate left/right slightly
          y = index * 250;                 // Stack vertically
        } else {
          // Standard grid for main flow if missing
          const col = index % 5;
          const row = Math.floor(index / 5);
          x = col * 450;
          y = row * 300;
        }
      }

      // Apply the Offset (crucial for Event flows)
      y = y + startYOffset;

      // Track the bottom-most node of the main flow
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

  // 2. Process Event Flows
  // Start 2000px below the lowest point of the main flow to ensure clean separation
  let eventCursorY = maxMainY + 2000; 

  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      // Add Header Node
      nodes.push({
        id: `header-${eventName}`,
        type: 'groupHeader',
        position: { x: 0, y: eventCursorY - 150 },
        data: { label: `Event: ${eventName}` },
        draggable: false,
      });

      if (eventData.process) {
        processFlowScope(eventData.process, `${eventName}-`, true, eventCursorY);
      }
      
      // Calculate how tall this event flow likely is to position the next one
      const activityCount = eventData.process?.activities ? Object.keys(eventData.process.activities).length : 5;
      const estimatedHeight = activityCount * 250; 
      
      eventCursorY += estimatedHeight + 500; // Add padding for next event
    });
  }

  return { nodes, edges };
};
