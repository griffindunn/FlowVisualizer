// src/processWxccJson.js
import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

const EDGE_TYPE = 'default'; 
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
      const config = getNodeConfig(rawType);

      // Use the explicit nodeType string from config
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
        
        if (!sourceHandleId || sourceHandleId === '' || sourceHandleId === 'true' || sourceHandleId === 'out') {
             sourceHandleId = 'default';
        }

        const isErrorPath = ['error', 'timeout', 'invalid', 'false', 'failure', 'insufficient_data'].includes(sourceHandleId);

        edges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: sourceHandleId, 
          type: EDGE_TYPE,
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
      });
    }
  };

  if (json.process) {
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
