// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- CONFIGURATION ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 160; 
  const X_SPACING = 500;   // Wide horizontal gap
  const Y_SPACING = 100;   // Vertical gap

  // 1. Build Graph
  const graph = {};
  nodes.forEach(n => {
    graph[n.id] = { 
      ...n, 
      children: [], 
      measuredHeight: 0, 
      x: 0, 
      y: 0,
      visited: false
    };
  });

  edges.forEach(edge => {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].children.push(edge.target);
    }
  });

  // 2. Helper: Layout a Single Tree Root
  // Returns bounding box { width, height } of the tree
  const layoutTree = (rootId, startX, startY, visitedSet) => {
    // Measure Phase (Recursive)
    const measure = (nodeId) => {
      if(visitedSet.has(nodeId)) return 0;
      visitedSet.add(nodeId);
      
      const node = graph[nodeId];
      if(!node) return 0;

      if(node.children.length === 0) {
        node.measuredHeight = NODE_HEIGHT + Y_SPACING;
        return node.measuredHeight;
      }

      let totalH = 0;
      node.children.forEach(child => totalH += measure(child));
      node.measuredHeight = Math.max(NODE_HEIGHT + Y_SPACING, totalH);
      return node.measuredHeight;
    };

    // Place Phase (Recursive)
    const place = (nodeId, x, y) => {
      const node = graph[nodeId];
      if(!node) return;

      node.x = x;
      
      if(node.children.length === 0) {
        node.y = y;
        return;
      }

      let currentY = y;
      node.children.forEach(childId => {
        place(childId, x + X_SPACING, currentY);
        currentY += graph[childId].measuredHeight;
      });

      // Center Parent
      const first = graph[node.children[0]];
      const last = graph[node.children[node.children.length-1]];
      if(first && last) {
        node.y = (first.y + last.y) / 2;
      } else {
        node.y = y;
      }
    };

    // Run
    measure(rootId);
    // Reset visited for placement? No, strict tree means we only visit once.
    // However, for measurement cycle breaking we used visitedSet.
    // For placement we rely on tree structure.
    place(rootId, startX, startY);

    return graph[rootId].measuredHeight;
  };


  // 3. Execution
  const mainRoots = nodes.filter(n => !n.data?.isEventNode && n.type === 'StartNode');
  // If no start node, find orphans (fallback)
  if(mainRoots.length === 0) {
    const targets = new Set(edges.map(e => e.target));
    nodes.filter(n => !n.data?.isEventNode && !targets.has(n.id)).forEach(n => mainRoots.push(n));
  }

  const eventHeaders = nodes.filter(n => n.type === 'groupHeader');
  
  const placedNodes = new Set();

  // A. Layout Main Flow
  let mainCursorY = 0;
  mainRoots.forEach(root => {
    const height = layoutTree(root.id, 0, mainCursorY, placedNodes);
    mainCursorY += height + 200; // Gap between main trees
  });

  // B. Layout Event Flows
  // Start well below the main flow
  let eventCursorY = mainCursorY + 400;

  eventHeaders.forEach(header => {
    // 1. Place Header
    const hNode = graph[header.id];
    if(hNode) {
      hNode.x = 0;
      hNode.y = eventCursorY;
      placedNodes.add(header.id);
    }
    eventCursorY += 150; // Space after header

    // 2. Find Roots belonging to this Event
    const eventName = header.data.label.replace('Event: ', '');
    // Heuristic: Event nodes usually share a prefix or we find the StartNode for this event
    // In your processWxccJson, you prefixed IDs with `${eventName}-`.
    const eventStartNode = nodes.find(n => 
      n.id.startsWith(eventName + '-') && n.type !== 'groupHeader' && 
      // It's a root if nothing points to it within this event scope
      !edges.some(e => e.target === n.id)
    );

    if(eventStartNode) {
       const height = layoutTree(eventStartNode.id, 0, eventCursorY, placedNodes);
       eventCursorY += height + 200;
    } else {
       // Fallback: Just dump orphans linearly if no tree structure found
       const orphans = nodes.filter(n => n.id.startsWith(eventName + '-') && !placedNodes.has(n.id));
       orphans.forEach(n => {
         const node = graph[n.id];
         node.x = 0;
         node.y = eventCursorY;
         eventCursorY += NODE_HEIGHT + 50;
         placedNodes.add(n.id);
       });
    }
  });


  // 4. Map Final Positions
  const finalNodes = nodes.map(node => {
    const gNode = graph[node.id];
    // If layout touched it, use new pos. Else (rare orphan), keep original or 0.
    const x = (gNode && placedNodes.has(node.id)) ? gNode.x : (node.position.x || 0);
    const y = (gNode && placedNodes.has(node.id)) ? gNode.y : (node.position.y || 0);

    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: { x, y },
    };
  });

  return { nodes: finalNodes, edges };
};
