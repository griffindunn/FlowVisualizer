// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  // --- CONFIGURATION ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 160; 
  const X_SPACING = 600;   // Wide horizontal gap prevents line crossovers
  const Y_SPACING = 120;   // Vertical gap separates branches clearly

  // 1. Initialize Graph
  // We attach layout metadata to every node
  const graph = {};
  nodes.forEach(n => {
    graph[n.id] = { 
      ...n, 
      treeChildren: [], // Strict children for layout (no cycles)
      measuredHeight: 0, 
      x: 0, 
      y: 0,
      visited: false
    };
  });

  // 2. Build Spanning Tree (BFS)
  // This is the critical step that prevents crashes.
  // We only allow a node to have ONE parent for layout purposes.
  // Any secondary connections (merges/cycles) are ignored for spacing.
  
  const targets = new Set(edges.map(e => e.target));
  // Roots are Start Nodes, Event Headers, or nodes with no incoming edges
  const roots = nodes.filter(n => !targets.has(n.id) || n.type === 'StartNode' || n.data?.isEventNode || n.type === 'groupHeader');

  // Sort edges: Prioritize "Happy Path" (Success/Default) to keep the tree straight
  const sortedEdges = [...edges].sort((a, b) => {
    const isGoodA = ['success', 'default', 'true'].some(t => (a.sourceHandle||'').toLowerCase().includes(t));
    const isGoodB = ['success', 'default', 'true'].some(t => (b.sourceHandle||'').toLowerCase().includes(t));
    return isGoodB - isGoodA; 
  });

  const visited = new Set();
  const queue = [...roots.map(n => n.id)];
  queue.forEach(id => visited.add(id));

  // Breadth-First Search to connect the tree
  while(queue.length > 0) {
    const parentId = queue.shift();
    // Get outgoing edges for this node
    const myEdges = sortedEdges.filter(e => e.source === parentId);
    
    myEdges.forEach(edge => {
      const childId = edge.target;
      // If child exists and hasn't been visited, add it to the layout tree
      if (graph[childId] && !visited.has(childId)) {
        visited.add(childId);
        graph[parentId].treeChildren.push(childId);
        queue.push(childId);
      }
    });
  }

  // 3. Measure Phase (Recursive Post-Order)
  // Calculates the total height of every subtree
  const measure = (nodeId) => {
    const node = graph[nodeId];
    if (!node) return 0;

    if (node.treeChildren.length === 0) {
      node.measuredHeight = NODE_HEIGHT + Y_SPACING;
      return node.measuredHeight;
    }

    let totalHeight = 0;
    node.treeChildren.forEach(childId => {
      totalHeight += measure(childId);
    });

    // Height is Max(Children stack, Node height)
    node.measuredHeight = Math.max(NODE_HEIGHT + Y_SPACING, totalHeight);
    return node.measuredHeight;
  };

  // 4. Place Phase (Recursive Pre-Order)
  // Assigns actual X, Y coordinates based on measurements
  const place = (nodeId, x, y) => {
    const node = graph[nodeId];
    if (!node) return;

    node.x = x;
    
    // If we have children, stack them vertically
    if (node.treeChildren.length > 0) {
      let currentChildY = y;
      
      node.treeChildren.forEach(childId => {
        place(childId, x + X_SPACING, currentChildY);
        currentChildY += graph[childId].measuredHeight;
      });

      // Center the parent node relative to its children
      const firstChild = graph[node.treeChildren[0]];
      const lastChild = graph[node.treeChildren[node.treeChildren.length - 1]];
      
      node.y = (firstChild.y + lastChild.y) / 2;
    } else {
      node.y = y;
    }
  };

  // 5. Execute Layout
  // We process Main Flow and Event Flows independently to prevent mixing
  
  let globalCursorY = 0;

  // Split roots
  const mainRoots = roots.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventRoots = roots.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  // A. Layout Main Flow
  mainRoots.forEach(root => {
    if(graph[root.id]) {
      measure(root.id);
      place(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 200; // Gap between main trees
    }
  });

  // Determine Safe Start for Events
  // Check actual positions to find the lowest point of the Main Flow
  let maxMainY = globalCursorY;
  Object.values(graph).forEach(n => {
    if (!n.data?.isEventNode && n.y > maxMainY) maxMainY = n.y;
  });

  globalCursorY = maxMainY + 400; // Big buffer

  // B. Layout Event Flows
  eventRoots.forEach(root => {
    if (!graph[root.id]) return;

    // If it's a Header, just place it
    if (root.type === 'groupHeader') {
      graph[root.id].x = 0;
      graph[root.id].y = globalCursorY;
      globalCursorY += 150;
    } else {
      // It's an Event Start Node
      measure(root.id);
      place(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 200;
    }
  });

  // 6. Map results back to React Flow nodes
  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    // If a node was unreachable (orphan/cycle), it might have 0,0.
    // We leave it at 0,0 or its original pos if not visited.
    // Ideally, everything is visited via the roots list.
    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: { x: gNode.x, y: gNode.y },
    };
  });

  return { nodes: layoutedNodes, edges };
};
