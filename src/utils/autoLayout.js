// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- TUNING KNOBS (Increased for PDF/Visual Clarity) ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 160; // Max height reservation per node
  
  // WIDER GAP: Gives room for lines to curve backward without hitting nodes
  const X_SPACING = 600;   
  
  // TALLER GAP: distinct separation between "True" and "False" branches
  const Y_SPACING = 120;   

  // 1. Build the Graph Map
  const graph = {};
  nodes.forEach(n => {
    graph[n.id] = { 
      ...n, 
      children: [], 
      allChildren: [], 
      measuredHeight: 0, 
      x: 0, 
      y: 0,
      visited: false 
    };
  });

  // Helper to check connection types for sorting
  const getEdgeLabel = (source, target) => {
    const edge = edges.find(e => e.source === source && e.target === target);
    return edge?.sourceHandle || 'default';
  };

  // 2. Connect Edges & Build Hierarchy
  edges.forEach(edge => {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].children.push(edge.target);
    }
  });

  // 3. Identify Roots (Start Node or Event Headers)
  const targets = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targets.has(n.id) || n.type === 'StartNode' || n.data?.isEventNode);

  // 4. SMART SORT: Optimize Children Order to reduce crossings
  Object.values(graph).forEach(node => {
    if (node.children.length > 1) {
      node.children.sort((aId, bId) => {
        const typeA = getEdgeLabel(node.id, aId);
        const typeB = getEdgeLabel(node.id, bId);

        // Priority 1: "Success" or "Default" goes to TOP (keeps main flow straight)
        const isSuccessA = typeA === 'success' || typeA === 'default' || typeA === 'true';
        const isSuccessB = typeB === 'success' || typeB === 'default' || typeB === 'true';
        if (isSuccessA && !isSuccessB) return -1;
        if (!isSuccessA && isSuccessB) return 1;

        // Priority 2: "Error", "Timeout", "Invalid" go to BOTTOM (outer edges)
        const isBadA = ['error', 'timeout', 'invalid', 'failure'].includes(typeA);
        const isBadB = ['error', 'timeout', 'invalid', 'failure'].includes(typeB);
        if (isBadA && !isBadB) return 1;
        if (!isBadA && isBadB) return -1;

        return 0;
      });
    }
  });

  // 5. MEASURE PHASE: Calculate total height of every subtree
  const measureTree = (nodeId, visitedPath = new Set()) => {
    const node = graph[nodeId];
    if (!node || node.visited) return 0; 
    
    // Cycle Check
    if (visitedPath.has(nodeId)) return 0;
    visitedPath.add(nodeId);

    if (node.children.length === 0) {
      node.measuredHeight = NODE_HEIGHT + Y_SPACING;
      return node.measuredHeight;
    }

    let totalHeight = 0;
    node.children.forEach(childId => {
      // Create a new set for the child's path to allow parallel branches to share nodes
      // but prevent loops within a single branch
      totalHeight += measureTree(childId, new Set(visitedPath));
    });

    // Parent height is max of (children stack) OR (self height)
    node.measuredHeight = Math.max(NODE_HEIGHT + Y_SPACING, totalHeight);
    return node.measuredHeight;
  };

  // 6. PLACE PHASE: Assign X/Y coordinates
  const placeTree = (nodeId, x, y) => {
    const node = graph[nodeId];
    if (!node || node.visited) return;
    node.visited = true;

    // 1. Position Children first (Post-order)
    let currentChildY = y;
    
    if (node.children.length === 0) {
      node.x = x;
      node.y = y;
      return;
    }

    node.children.forEach(childId => {
      const child = graph[childId];
      if (!child.visited) {
        placeTree(childId, x + X_SPACING, currentChildY);
        // Use the child's *actual* measured bulk to step down
        currentChildY += child.measuredHeight; 
      }
    });

    // 2. Position Self (Centering)
    const firstChild = graph[node.children[0]];
    const lastChild = graph[node.children[node.children.length - 1]];

    let centerY = y;
    // Only center if we actually placed the children just now
    if (firstChild && lastChild && firstChild.x > x) { 
       centerY = (firstChild.y + lastChild.y) / 2;
    } else {
       // If children were already placed (merge point), don't jump far away.
       centerY = y + (NODE_HEIGHT / 2);
    }

    node.x = x;
    node.y = centerY;
  };

  // --- EXECUTION ---
  const allNodes = [...nodes];
  
  // Sort roots: Main Flow first, then Events
  const sortedRoots = roots.sort((a, b) => {
    if (a.type === 'StartNode') return -1;
    if (a.data?.isEventNode && !b.data?.isEventNode) return 1;
    if (a.type === 'groupHeader') return 1;
    return 0;
  });

  const mainRoots = sortedRoots.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventRoots = sortedRoots.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  let globalCursorY = 0;

  // A. Main Flow Layout
  mainRoots.forEach(root => {
    if(graph[root.id]) {
      measureTree(root.id);
      placeTree(root.id, 0, globalCursorY);
      // Add massive gap between independent trees
      globalCursorY += graph[root.id].measuredHeight + 300; 
    }
  });

  // B. Event Flows Layout (Below Main)
  // Ensure we start well below the lowest point of the main flow
  let maxMainY = 0;
  allNodes.forEach(n => {
    const gNode = graph[n.id];
    if (gNode && !n.data?.isEventNode && gNode.y > maxMainY) maxMainY = gNode.y;
  });

  globalCursorY = Math.max(globalCursorY, maxMainY + 400);

  eventRoots.forEach(root => {
    if (!graph[root.id]) return;

    if (root.type === 'groupHeader') {
      graph[root.id].x = 0;
      graph[root.id].y = globalCursorY;
      graph[root.id].visited = true;
      globalCursorY += 150;
    } else {
      measureTree(root.id);
      placeTree(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 200;
    }
  });

  // 7. Map back to React Flow
  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    // Safety check for unvisited nodes (should be rare)
    const x = gNode.x !== undefined ? gNode.x : 0;
    const y = gNode.y !== undefined ? gNode.y : (globalCursorY += 200);

    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
};
