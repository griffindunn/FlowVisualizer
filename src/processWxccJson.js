// src/processWxccJson.js
import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

const EDGE_TYPE = 'curvedLoop'; 
const SPACING_FACTOR_X = 2.2; 
const SPACING_FACTOR_Y = 2.2;

export const transformWxccJson = (json) => {
  const nodes = [];
  let rawEdges = []; 
  let maxMainY = 0;

  const getWidget = (id, currentDiagram) => {
    return currentDiagram?.widgets?.[id];
  };

  const processFlowScope = (flowData, diagramData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const activityList = Object.values(activities);

    // --- Helper: Get Internal Links for Menu/Case Data ---
    const getLinksForActivity = (activity) => {
        // We prefer the internal 'links' array as it contains the mapping logic (e.g. 1 -> Sales)
        // If missing, we fallback to the global link list, but that lacks the '1=' logic usually.
        const internal = activity.links || activity.outcomes || [];
        if (internal.length > 0) return internal;
        
        // Fallback: Find wires connected to this node in the global scope
        return (links || []).filter(l => l.sourceActivityId === activity.id);
    };

    // --- 1. NODES ---
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

      // --- EXTRACT DETAILS ---
      let details = { ...activity.properties };
      const nodeLinks = getLinksForActivity(activity);

      // LOGIC: Menu Node Choices
      if (nodeType === 'MenuNode') {
        const extractedChoices = {};
        nodeLinks.forEach(link => {
            const key = link.interactionCondition || link.name || link.conditionExpr;
            // Improved Label Search: displayName -> label -> description -> name -> key
            const label = link.displayName || link.label || link.description || link.name || key; 
            
            const isSystem = ['error', 'timeout', 'invalid', 'failure', 'busy', 'no_answer', 'exception'].some(k => String(key).toLowerCase().includes(k));
            
            if (key && !isSystem) {
                extractedChoices[key] = label;
            }
        });
        details.choices = extractedChoices;
      }

      // LOGIC: Case Node Outcomes
      if (nodeType === 'CaseNode') {
        const extractedCases = {};
        nodeLinks.forEach(link => {
            const key = link.interactionCondition || link.name || link.conditionExpr;
            const label = link.displayName || link.label || link.description || link.name || key;
            
            const isSystem = ['error', 'timeout', 'failure', 'default'].some(k => String(key).toLowerCase().includes(k));

            if (key && !isSystem && key !== 'default') {
                extractedCases[key] = label;
            }
        });
        details.cases = extractedCases;
      }

      nodes.push({
        id: `${prefix}${activity.id}`,
        type: nodeType, 
        position: { x, y },
        data: {
          label: activity.name,
          nodeType: rawType,
          details: details, 
          isEventNode: isEvent             
        },
        zIndex: 10 
      });
    });

    // --- 2. EDGES ---
    if (links) {
      links.forEach((link) => {
        // Determine the "Raw" handle ID from the link definition
        let rawHandleId = link.interactionCondition || link.name || link.conditionExpr;
        
        // --- NORMALIZATION LOGIC ---
        // We need to map the JSON link name to the specific <Handle id="..."> in our React components.
        // If we don't match exactly, the line disappears.
        
        const sourceNode = activities[link.sourceActivityId];
        const sourceNodeType = sourceNode ? (sourceNode.properties?.activityName || sourceNode.activityName) : 'unknown';
        const config = getNodeConfig(sourceNodeType);
        const componentType = config.nodeType;

        let finalHandleId = 'default'; // Default to success path

        // Check if it is a known error path
        const isErrorPath = ['error', 'failure', 'invalid', 'false', 'insufficient_data', 'busy', 'no_answer', 'exception'].some(k => String(rawHandleId).toLowerCase().includes(k));
        const isTimeout = String(rawHandleId).toLowerCase().includes('timeout');

        if (isErrorPath) {
            // Map specific errors to their handle IDs (e.g. 'busy' -> 'busy', 'error' -> 'error')
            // We strip extra text to match the simple IDs in our components
            if (String(rawHandleId).toLowerCase().includes('busy')) finalHandleId = 'busy';
            else if (String(rawHandleId).toLowerCase().includes('no_answer')) finalHandleId = 'no_answer';
            else if (String(rawHandleId).toLowerCase().includes('invalid')) finalHandleId = 'invalid';
            else if (String(rawHandleId).toLowerCase().includes('insufficient')) finalHandleId = 'insufficient_data';
            else if (String(rawHandleId).toLowerCase().includes('failure')) finalHandleId = 'failure';
            else finalHandleId = 'error'; // Catch-all for generic errors
        } else if (isTimeout) {
            finalHandleId = 'timeout';
        } else {
            // HAPPY PATH LOGIC
            // If it's a Menu or Case, we MUST use the specific key (e.g., "1", "Sales")
            if (componentType === 'MenuNode' || componentType === 'CaseNode') {
                finalHandleId = rawHandleId; 
            } 
            // For EVERYTHING ELSE (SetVariable, PlayMessage, etc.), force to 'default'
            // This fixes the "Missing Line" issue where JSON says "Done" but Node expects "default"
            else {
                finalHandleId = 'default';
            }
        }

        // Color & Z-Index
        const isRedLine = isErrorPath || isTimeout;
        const color = isRedLine ? '#D32F2F' : '#555';
        const zIndex = isRedLine ? 1999 : 2000;

        rawEdges.push({
          id: `${prefix}${link.id}`,
          source: `${prefix}${link.sourceActivityId}`,
          target: `${prefix}${link.targetActivityId}`,
          sourceHandle: finalHandleId, 
          type: EDGE_TYPE, 
          zIndex: zIndex, 
          markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: color },
          style: { stroke: color, strokeWidth: 2 }, 
          data: { 
            isEventEdge: isEvent,
            isRedLine: isRedLine, 
            isHideable: isErrorPath && !isTimeout 
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
      
      let blockHeight = 600;
      if(eventData.process?.activities) {
          blockHeight = (Object.keys(eventData.process.activities).length * 150) + 500;
      }
      eventCursorY += blockHeight; 
    });
  }

  const sortedEdges = rawEdges.sort((a, b) => {
      const scoreA = a.data.isRedLine ? 0 : 1; 
      const scoreB = b.data.isRedLine ? 0 : 1;
      return scoreA - scoreB; 
  });

  return { nodes, edges: sortedEdges };
};
