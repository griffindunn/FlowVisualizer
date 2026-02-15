import { MarkerType } from 'reactflow';
import { getNodeConfig } from './wxccConfig';

const EDGE_TYPE = 'curvedLoop'; 
const SPACING_FACTOR_X = 2.2; 
const SPACING_FACTOR_Y = 2.2;

export const transformWxccJson = (json) => {
  const nodes = [];
  let rawEdges = []; 
  let maxMainY = 0;

  // Helper: Find widget layout data
  const getWidget = (id, currentDiagram) => {
    return currentDiagram?.widgets?.[id];
  };

  const processFlowScope = (flowData, diagramData, prefix = '', isEvent = false, startYOffset = 0) => {
    if (!flowData || !flowData.activities) return;

    const { activities, links } = flowData;
    const activityList = Object.values(activities);

    // --- Helper: Get Internal Links for Menu/Case Data ---
    const getLinksForActivity = (activity) => {
        const internal = activity.links || activity.outcomes || [];
        if (internal.length > 0) return internal;
        return (links || []).filter(l => l.sourceActivityId === activity.id);
    };

    // --- 1. NODES ---
    activityList.forEach((activity, index) => {
      const widget = getWidget(activity.id, diagramData);
      
      let x = 0;
      let y = 0;

      // Coordinate Logic
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
            const key = link.interactionCondition || link.conditionExpr || link.name;
            
            // PRIORITY FIX: Check 'name' BEFORE 'label'. 
            // 'label' is often the digit ("1"), 'name' is the user text ("Sales").
            const label = link.displayName || link.name || link.label || link.description || key;
            
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
            const key = link.interactionCondition || link.conditionExpr || link.name;
            // PRIORITY FIX: Check 'name' BEFORE 'label'
            const label = link.displayName || link.name || link.label || link.description || key;
            
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
        let rawHandleId = link.interactionCondition || link.name || link.conditionExpr;
        
        // --- HANDLE NORMALIZATION ---
        
        // 1. Identify Source Node Type to decide connection logic
        const sourceNode = activities[link.sourceActivityId];
        // Safely get the type string (handle missing props)
        const sourceNodeTypeString = sourceNode 
            ? (sourceNode.properties?.activityName || sourceNode.activityName || 'unknown') 
            : 'unknown';
            
        const config = getNodeConfig(sourceNodeTypeString);
        const componentType = config.nodeType;

        let finalHandleId = 'default'; 

        // 2. Identify Edge Type (Error vs Success)
        const isErrorPath = ['error', 'failure', 'invalid', 'false', 'insufficient_data', 'busy', 'no_answer', 'exception'].some(k => String(rawHandleId).toLowerCase().includes(k));
        const isTimeout = String(rawHandleId).toLowerCase().includes('timeout');

        // 3. Assign Final ID
        if (isErrorPath) {
            if (String(rawHandleId).toLowerCase().includes('busy')) finalHandleId = 'busy';
            else if (String(rawHandleId).toLowerCase().includes('no_answer')) finalHandleId = 'no_answer';
            else if (String(rawHandleId).toLowerCase().includes('invalid')) finalHandleId = 'invalid';
            else if (String(rawHandleId).toLowerCase().includes('insufficient')) finalHandleId = 'insufficient_data';
            else if (String(rawHandleId).toLowerCase().includes('failure')) finalHandleId = 'failure';
            else finalHandleId = 'error'; 
        } else if (isTimeout) {
            finalHandleId = 'timeout';
        } else {
            // HAPPY PATH LOGIC
            if (componentType === 'MenuNode' || componentType === 'CaseNode') {
                // For Menu/Case, we MUST match the specific key (e.g. "1")
                finalHandleId = rawHandleId; 
            } else {
                // For SetVariable, PlayMessage, etc., force to 'default'
                // This connects "Done", "Next", "True", "Success" all to the main dot.
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
