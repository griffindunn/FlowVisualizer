import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

const EDGE_TYPE = 'curvedLoop'; 
const SPACING_FACTOR_X = 2.2; 
const SPACING_FACTOR_Y = 2.2;

export const transformWxccJson = (json) => {
  const nodes = [];
  const edges = [];
  let maxMainY = 0;

  // Helper to find widget coordinates across possible locations
  const getWidget = (id, localWidgets, globalWidgets) => {
    return localWidgets?.[id] || globalWidgets?.[id];
  };

  const processFlowScope = (flowData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    
    // Look for widgets in the local scope first, then fallback to global
    const localWidgets = flowData.diagram?.widgets || {};
    const globalWidgets = json.diagram?.widgets || {};

    Object.values(activities).forEach((activity, index) => {
      const widget = getWidget(activity.id, localWidgets, globalWidgets);
      
      let x = 0;
      let y = 0;

      if (widget?.point) {
        // FOUND COORDINATES - Use them!
        x = widget.point.x * SPACING_FACTOR_X;
        y = widget.point.y * SPACING_FACTOR_Y;
      } else {
        // FALLBACK LINEAR GRID (Only if no coordinates found)
        const row = Math.floor(index / 8); // Wider grid
        const col = index % 8;
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
  if (json.process) {
    processFlowScope(json.process, '', false, 0);
  }

  // 2. Process Event Flows (Start strictly below the main flow)
  // We add a large buffer to ensure no overlap if the main flow is tall
  let eventCursorY = maxMainY + 1500; 

  if (json.eventFlows && json.eventFlows.eventsMap) {
    Object.entries(json.eventFlows.eventsMap).forEach(([eventName, eventData]) => {
      // Add Header Node
      nodes.push({
        id: `header-${eventName}`,
        type: 'groupHeader',
        position: { x: 0, y: eventCursorY - 150 }, // Header sits above the flow
        data: { label: `Event: ${eventName}` },
        draggable: false,
      });

      if (eventData.process) {
        processFlowScope(eventData.process, `${eventName}-`, true, eventCursorY);
      }
      
      // Move the cursor down for the next Event Flow
      // We add a heuristic block of space (2500px) per event flow to keep them separated vertically
      eventCursorY += 2500; 
    });
  }

  return { nodes, edges };
};
