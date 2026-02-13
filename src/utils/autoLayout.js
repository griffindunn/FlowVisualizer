// src/utils/autoLayout.js

export const getLayoutedElements = (nodes, edges) => {
  const NODE_WIDTH = 320;
  const NODE_HEIGHT = 150;
  const X_SPACING = 400; // Horizontal gap
  const Y_SPACING = 200; // Vertical gap

  // 1. Build a graph map to understand relationships
  const graph = {};
  const levels = {};
  
  // Initialize nodes
  nodes.forEach(node => {
    graph[node.id] = { 
      id: node.id, 
      children: [], 
      parents: [], 
      width: node.width || NODE_WIDTH, 
      height: node.height || NODE_HEIGHT,
      level: -1,
      x: 0, 
      y: 0 
    };
  });

  // Map connections
  edges.forEach(edge => {
    if (graph[edge.source] && graph[edge.target]) {
      graph[edge.source].children.push(edge.target);
      graph[edge.target].parents.push(edge.source);
    }
  });

  // 2. Assign Levels (Breadth-First Search)
  // Find root nodes (nodes with no parents)
  const roots = Object.values(graph).filter(n => n.parents.length === 0);
  // If no clear roots (circular dependency), pick the first one
  const queue = roots.length > 0 ? roots : [Object.values(graph)[0]];
  
  queue.forEach(n => { n.level = 0; });

  const visited = new Set();
  
  let tempQueue = [...queue];
  while (tempQueue.length > 0) {
    const currentNode = tempQueue.shift();
    const currentId = currentNode.id;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Assign children to next level
    currentNode.children.forEach(childId => {
      const childNode = graph[childId];
      // Only push level down, never up (handles multiple parents)
      if (childNode.level < currentNode.level + 1) {
        childNode.level = currentNode.level + 1;
        tempQueue.push(childNode);
      }
    });
  }

  // 3. Group by Level
  const rows = [];
  Object.values(graph).forEach(node => {
    // Fallback for disconnected nodes
    const lvl = node.level === -1 ? 0 : node.level;
    if (!rows[lvl]) rows[lvl] = [];
    rows[lvl].push(node);
  });

  // 4. Calculate X/Y Coordinates
  // We center each row vertically based on the number of items
  rows.forEach((rowNodes, levelIndex) => {
    const rowHeight = rowNodes.length * Y_SPACING;
    let startY = -(rowHeight / 2); // Center vertically around 0

    rowNodes.forEach((node, nodeIndex) => {
      // X = Level * Horizontal Spacing
      node.x = levelIndex * X_SPACING;
      
      // Y = StartY + Node Index * Vertical Spacing
      node.y = startY + (nodeIndex * Y_SPACING);
    });
  });

  // 5. Apply positions back to React Flow nodes
  const layoutedNodes = nodes.map(node => {
    const layoutNode = graph[node.id];
    if (!layoutNode) return node;

    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: { x: layoutNode.x, y: layoutNode.y },
    };
  });

  return { nodes: layoutedNodes, edges };
};
