export const getLayoutedElements = (nodes, edges) => {
  // --- CONFIGURATION ---
  const NODE_WIDTH = 300; 
  const NODE_HEIGHT = 160; 
  const X_SPACING = 600;   // WIDER horizontal gap prevents line crossovers
  const Y_SPACING = 120;   // TALLER vertical gap gives branches breathing room

  const graph = {};
  nodes.forEach(n => {
    graph[n.id] = { 
      ...n, 
      treeChildren: [],
      measuredHeight: 0, 
      x: 0, 
      y: 0 
    };
  });

  const getEdgeLabel = (source, target) => {
    const edge = edges.find(e => e.source === source && e.target === target);
    return edge?.sourceHandle || 'default';
  };

  // Prioritize "Success/Default" edges to form the backbone (straight line)
  const sortedEdges = [...edges].sort((a, b) => {
    const isGoodA = ['success', 'default', 'true'].some(t => (a.sourceHandle||'').includes(t));
    const isGoodB = ['success', 'default', 'true'].some(t => (b.sourceHandle||'').includes(t));
    return isGoodB - isGoodA; 
  });

  const visited = new Set();
  const nodeHasParent = new Set();
  
  const connectTree = (parentId, childId) => {
    if (graph[parentId] && graph[childId] && !nodeHasParent.has(childId)) {
      graph[parentId].treeChildren.push(childId);
      nodeHasParent.add(childId);
    }
  };

  const targets = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targets.has(n.id) || n.type === 'StartNode' || n.data?.isEventNode);

  const queue = [...roots.map(n => n.id)];
  const reachable = new Set(queue);

  while(queue.length > 0) {
    const parentId = queue.shift();
    const myEdges = sortedEdges.filter(e => e.source === parentId);
    
    myEdges.forEach(edge => {
      const childId = edge.target;
      if (!reachable.has(childId)) {
        connectTree(parentId, childId);
        reachable.add(childId);
        queue.push(childId);
      } else if (!nodeHasParent.has(childId)) {
        connectTree(parentId, childId);
      }
    });
  }

  // Sorting Children for visual clarity (Success Top, Error Bottom)
  Object.values(graph).forEach(node => {
    if (node.treeChildren.length > 1) {
      node.treeChildren.sort((aId, bId) => {
        const typeA = getEdgeLabel(node.id, aId);
        const typeB = getEdgeLabel(node.id, bId);
        
        const isSuccessA = ['success', 'default', 'true'].some(t => typeA.includes(t));
        const isSuccessB = ['success', 'default', 'true'].some(t => typeB.includes(t));
        
        if (isSuccessA && !isSuccessB) return -1;
        if (!isSuccessA && isSuccessB) return 1;
        return 0;
      });
    }
  });

  const measureNode = (nodeId) => {
    const node = graph[nodeId];
    if (!node) return 0;
    
    if (node.treeChildren.length === 0) {
      node.measuredHeight = NODE_HEIGHT + Y_SPACING;
      return node.measuredHeight;
    }

    let totalHeight = 0;
    node.treeChildren.forEach(childId => {
      totalHeight += measureNode(childId);
    });

    node.measuredHeight = Math.max(NODE_HEIGHT + Y_SPACING, totalHeight);
    return node.measuredHeight;
  };

  const placeNode = (nodeId, x, y) => {
    const node = graph[nodeId];
    if (!node) return;

    node.x = x;
    
    if (node.treeChildren.length > 0) {
      let currentChildY = y;
      
      node.treeChildren.forEach(childId => {
        placeNode(childId, x + X_SPACING, currentChildY);
        currentChildY += graph[childId].measuredHeight;
      });

      const firstChild = graph[node.treeChildren[0]];
      const lastChild = graph[node.treeChildren[node.treeChildren.length - 1]];
      
      node.y = (firstChild.y + lastChild.y) / 2;
    } else {
      node.y = y;
    }
  };

  // Execution
  const sortedRoots = roots.sort((a, b) => {
    if (a.type === 'StartNode') return -1;
    if (a.data?.isEventNode && !b.data?.isEventNode) return 1;
    return 0;
  });

  const mainRoots = sortedRoots.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
  const eventRoots = sortedRoots.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

  let globalCursorY = 0;

  mainRoots.forEach(root => {
    if(graph[root.id]) {
      measureNode(root.id);
      placeNode(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 400; 
    }
  });

  globalCursorY += 400;

  eventRoots.forEach(root => {
    if (!graph[root.id]) return;

    if (root.type === 'groupHeader') {
      graph[root.id].x = 0;
      graph[root.id].y = globalCursorY;
      globalCursorY += 200;
    } else {
      measureNode(root.id);
      placeNode(root.id, 0, globalCursorY);
      globalCursorY += graph[root.id].measuredHeight + 300;
    }
  });

  const layoutedNodes = nodes.map(node => {
    const gNode = graph[node.id];
    const x = gNode.x || 0;
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
