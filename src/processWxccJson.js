// src/processWxccJson.js
import { MarkerType } from 'reactflow';

const EDGE_TYPE = 'default'; // Bezier Curve
const SPACING_FACTOR_X = 2.0; 
const SPACING_FACTOR_Y = 1.5;

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  let currentYOffset = 2500; 

  const processFlowScope = (flowData, prefix = '', isEvent = false) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const widgets = flowData.diagram?.widgets || json.diagram?.widgets || {}; 

    // 1. Process Nodes
    Object.values(activities).forEach((activity, index) => {
      const widget = widgets[activity.id];
      let x = 0;
      let y = 0;

      if (widget?.point) {
        x = widget.point.x * SPACING_FACTOR_X;
        y = widget.point.y * SPACING_FACTOR_Y;
      } else {
        const row = Math.floor(index / 5);
        const col = index % 5;
        x = col * 450; 
        y = row * 300;
      }
      y = y + (isEvent ? currentYOffset : 0);

      const rawType = activity.properties?.activityName || activity.activityName || 'unknown';

      nodes.push({
        id: `${prefix}${activity.id}`,
        type: 'wxccNode', 
        position: { x, y },
        data: {
          label: activity.name,
          nodeType: rawType,
          details: activity.properties,    
          isEventNode: isEvent             
        },
        // Force nodes to be lower than edges if we want edges on top
        zIndex: 10 
      });
    });

    // 2. Process Edges
    if (links) {
      links.forEach((link) => {
        let sourceHandleId = link.conditionExpr;
        
        // Normalize handle IDs
        // If conditionExpr is empty or 'true', it's the default path
        if (!sourceHandleId || sourceHandleId === '' || sourceHandleId === 'true') {
             sourceHandleId = 'default';
        }

        // Check if this is an error path for styling
        const isErrorPath = ['error', 'timeout', 'invalid', 'false', 'failure'].includes(sourceHandleId);

        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, 
          type: EDGE_TYPE,
          zIndex: 20, // Higher than nodes (10) so lines appear on top
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: isErrorPath ? '#D32F2F' : '#555', // Red arrow for errors
          },
          style: { 
            stroke: isErrorPath ? '#D32F2F' : '#555', // Red line for errors
            strokeWidth: 2 
          }, 
          data: { isEventEdge: isEvent }
        });
      });
    }
  };

  if (json.process) {
    console.log("Processing Main Flow...");
    processFlowScope(json.process, '', false);
  }

  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      nodes.push({
        id: `header-${eventName}`,
        type: 'groupHeader',
        position: { x: 0, y: currentYOffset - 150 },
        data: { label: `Event: ${eventName}` },
        draggable: false,
      });

      if (eventData.process) {
        processFlowScope(eventData.process, `${eventName}-`, true);
      }
      currentYOffset += 2000;
    });
  }

  return { nodes, edges };
};
