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

  // Helper to safely extract widgets
  // We now pass the specific diagram for the current flow scope
  const getWidget = (id, currentDiagram) => {
    return currentDiagram?.widgets?.[id];
  };

  const processFlowScope = (flowData, diagramData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    
    // Sort activities to keep consistent order if fallback is needed
    const activityList = Object.values(activities);

    activityList.forEach((activity, index) => {
      // Look for the widget in the specific diagram passed for this scope
      const widget = getWidget(activity.id, diagramData);
      
      let x = 0;
      let y = 0;

      if (widget?.point) {
        // FOUND COORDINATES (Standard Case)
        x = widget.point.x * SPACING_FACTOR_X;
        y = widget.point.y * SPACING_FACTOR_Y;
      } else {
        // FALLBACK (Missing Coordinates)
        // If we still can't find coords, use a simple grid
        const col = index % 8;
        const row = Math.floor(index / 8);
        x = col * 400; 
        y = row * 250;
      }

      // Apply Vertical Offset (Separates Events from Main Flow visually)
      y = y + startYOffset;

      // Track bottom of main flow so we know where to start events
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
  // Pass json.process (Logic) AND json.diagram (Layout)
  if (json.process) {
    processFlowScope(json.process, json.diagram, '', false, 0);
  }

  // 2. Process Event Flows
  // Start well below the main flow
  let eventCursorY = maxMainY + 1500; 

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
        // CRITICAL FIX: Pass eventData.diagram explicitly here.
        // Previously it was trying to find .diagram inside .process or using global diagram.
        processFlowScope(eventData.process, eventData.diagram, `${eventName}-`, true, eventCursorY);
      }
      
      // Advance cursor for next event block
      // Calculate approximate height of this block to push the next one down
      let blockHeight = 500;
      if (eventData.diagram && eventData.diagram.widgets) {
         // Find max Y in this specific event diagram to accurately space the next one
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
