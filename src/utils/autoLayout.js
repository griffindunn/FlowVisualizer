// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- TUNING KNOBS (Adjust these to fit your PDF/Screen) ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 160; // Approximate max height of a node
  const X_SPACING = 400;   // Horizontal distance between columns
  const Y_SPACING = 60;    // Vertical gap between neighbor nodes (space for lines)

  // 1. Build the Graph
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

  // 2. Connect Edges (Forward direction only for layout)
  edges.forEach(edge => {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].children.push(edge.target);
    }
  });

  // 3. Identify "Roots" (Nodes with no parents in the current scope)
  const getRoots = (nodeList) => {
    const nodeIds = new Set(nodeList.map(n => n.id));
    const childrenIds = new Set();
    edges.forEach(e => {
      if(nodeIds.has(e.source) && nodeIds.has(e.target)) {
        childrenIds.add(e.target);
      }
    });
    return nodeList.filter(n => !childrenIds.has(n.id) || n.type === 'StartNode' || n.data?.isEventNode);
  };

  // 4. MEASURE PHASE: Calculate total height of every subtree
  const measureTree = (nodeId, visitedPath = new Set()) => {
    const node = graph[nodeId];
    if (!node || node.visited) return 0; // Skip if already handled (merge point) or cycle
    
    // Cycle Detection: If we see a node already in our current recursion path, stop.
    if (visitedPath.has(nodeId)) return 0;
    visitedPath.add(nodeId);

    if (node.children.length === 0) {
      node.measuredHeight = NODE_HEIGHT + Y_SPACING;
      return node.measuredHeight;
    }

    // Sort children to put "True/Yes" paths on top if possible (heuristic)
    // node.children.sort(); // Optional

    let totalHeight = 0;
    node.children.forEach(childId => {
      totalHeight += measureTree(childId, new Set(visitedPath));
    });

    // The height of this node is the MAX of (Its own height OR Sum of children height)
    node.measuredHeight = Math.max(NODE_HEIGHT + Y_SPACING, totalHeight);
    return node.measuredHeight;
  };

  // 5. PLACE PHASE: Assign X/Y coordinates
  const placeTree = (nodeId, x, y) => {
    const node = graph[nodeId];
    if (!node || node.visited) return;
    node.visited = true; // Mark as placed

    // 1. Position Children first to determine parent center
    let currentChildY = y;
    
    // If leaf node, just take the slot
    if (node.children.length === 0) {
      node.x = x;
      node.y = y;
      return;
    }

    // Stack children vertically
    node.children.forEach(childId => {
      const child = graph[childId];
      // Only layout if not already placed (handles merges somewhat simply)
      if (!child.visited) {
        placeTree(childId, x + X_SPACING, currentChildY);
        currentChildY += child.measuredHeight;
      }
    });

    // 2. Position Self (Parent)
    // Find the Y-range of direct children to center the parent
    const firstChild = graph[node.children[0]];
    const lastChild = graph[node.children[node.children.length - 1]];

    let centerY = y;
    if (firstChild && lastChild && firstChild.y !== undefined && lastChild.y !== undefined) {
      centerY = (firstChild.y + lastChild.y) / 2;
    } else {
      // Fallback if children were already visited/placed elsewhere
      centerY = y + (node.measuredHeight / 2) - (NODE_HEIGHT / 2);
    }

    node.x = x;
    node.y = centerY;
  };

  // --- EXECUTION ---
  
  // A. Main Flow
  const mainNodes = nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const mainRoots = getRoots(mainNodes);
  
  let globalCursorY = 0;

  mainRoots.forEach(root => {
    measureTree(root.id);
    placeTree(root.id, 0, globalCursorY);
    globalCursorY += graph[root.id].measuredHeight + 200; // Gap between disjoint trees
  });

  // B. Event Flows (Placed safely below Main Flow)
  const eventNodes = nodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');
  const eventRoots = getRoots(eventNodes);
  
  // Ensure we start below the lowest point of the main flow
  let maxMainY = 0;
  mainNodes.forEach(n => {
    const gNode = graph[n.id];
    if (gNode && gNode.y > maxMainY) maxMainY = gNode.y;
  });
  
  globalCursorY = Math.max(globalCursorY, maxMainY + NODE_HEIGHT + 400);

  eventRoots.forEach(root => {
    if (root.type === 'groupHeader') {
      const gNode = graph[root.id];
      gNode.x = 0;
      gNode.y = globalCursorY;
      gNode.visited = true;
      globalCursorY += 100;
    } else {
      measureTree(root.id);
      placeTree(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 100;
    }
  });

  // 6. Map back to React Flow
  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: { x: gNode.x, y: gNode.y },
    };
  });

  return { nodes: layoutedNodes, edges };
};
