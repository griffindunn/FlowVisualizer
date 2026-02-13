// src/processWxccJson.js
import { MarkerType } from 'reactflow';

const EDGE_TYPE = 'default'; // Bezier Curve
const SPACING_FACTOR_X = 2.0; // Spread wider for horizontal flow readability
const SPACING_FACTOR_Y = 1.5;

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  let currentYOffset = 2500; 

  const processFlowScope = (flowData, prefix = '', isEvent = false) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const widgets = flowData.diagram?.widgets || json.diagram?.widgets || {}; 

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

      // Robust type checking
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
      });
    });

    if (links) {
      links.forEach((link) => {
        // Map WxCC condition expressions to our Handle IDs
        // 0 usually equals Default in Cases
        let sourceHandleId = link.conditionExpr;
        
        // Normalize handle IDs
        if (!sourceHandleId || sourceHandleId === '' || sourceHandleId === 'true') {
             sourceHandleId = 'default';
        }
        
        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, 
          type: EDGE_TYPE,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: isEvent ? '#999' : '#555',
          },
          style: { 
            stroke: isEvent ? '#bbb' : '#555', 
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
