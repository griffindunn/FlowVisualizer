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

  // Helper to find widget coordinates
  const getWidget = (id, localWidgets, globalWidgets) => {
    return localWidgets?.[id] || globalWidgets?.[id];
  };

  const processFlowScope = (flowData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const localWidgets = flowData.diagram?.widgets || {};
    const globalWidgets = json.diagram?.widgets || {};

    // Sort activities to keep default order somewhat logical if coords are missing
    const activityList = Object.values(activities);

    activityList.forEach((activity, index) => {
      const widget = getWidget(activity.id, localWidgets, globalWidgets);
      let x = 0;
      let y = 0;

      if (widget?.point) {
        // FOUND COORDINATES (Best Case)
        x = widget.point.x * SPACING_FACTOR_X;
        y = widget.point.y * SPACING_FACTOR_Y;
      } else {
        // FALLBACK: Simple Vertical Stack (Prevents overlap/mashing)
        // Instead of a grid, we just separate them enough to be readable
        x = (index % 2) * 500; // Zig-zag slightly
        y = Math.floor(index / 2) * 200;
      }

      // Apply Offset
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

  // 2. Process Event Flows
  // Start well below main flow
  let eventCursorY = maxMainY + 1500; 

  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      // Header
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
      
      // Advance cursor for next event block
      // We calculate how many nodes were in this block to guess height, or just use a safe buffer
      const nodeCount = eventData.process?.activities ? Object.keys(eventData.process.activities).length : 5;
      eventCursorY += (nodeCount * 150) + 500; 
    });
  }

  return { nodes, edges };
};
