// src/utils/autoLayout.js

/**
 * A pure JS auto-layout algorithm that arranges nodes in a tree structure (Left-to-Right).
 * It separates the "Main Flow" from "Event Flows" to ensure the Events always appear below.
 */
export const getLayoutedElements = (nodes, edges) => {
  const NODE_WIDTH = 300;
  const NODE_HEIGHT = 150;
  const X_SPACING = 450; // Horizontal space between columns
  const Y_SPACING = 200; // Vertical space between rows

  // Helper: Layout a specific subset of nodes/edges
  const layoutSubset = (subsetNodes, subsetEdges, startX = 0, startY = 0) => {
    if (subsetNodes.length === 0) return { nodes: [], height: 0 };

    // 1. Build Graph Relationship
    const graph = {};
    subsetNodes.forEach(node => {
      graph[node.id] = { 
        id: node.id, 
        children: [], 
        parents: [], 
        level: -1,
        x: 0, 
        y: 0 
      };
    });

    subsetEdges.forEach(edge => {
      if (graph[edge.source] && graph[edge.target]) {
        graph[edge.source].children.push(edge.target);
        graph[edge.target].parents.push(edge.source);
      }
    });

    // 2. Assign Levels (BFS)
    // Find roots (nodes with no parents within this subset)
    let roots = Object.values(graph).filter(n => n.parents.length === 0);
    
    // Fallback for circular/disconnected graphs: just pick the first one
    if (roots.length === 0 && Object.values(graph).length > 0) {
      roots = [Object.values(graph)[0]];
    }

    const queue = [...roots];
    queue.forEach(n => n.level = 0);
    const visited = new Set(roots.map(n => n.id));

    while (queue.length > 0) {
      const current = queue.shift();

      current.children.forEach(childId => {
        const child = graph[childId];
        // Ensure child is always to the right of parent
        if (child.level < current.level + 1) {
          child.level = current.level + 1;
          if (!visited.has(child.id)) {
            visited.add(child.id);
            queue.push(child);
          }
        }
      });
    }

    // 3. Group by Level for Positioning
    const levels = [];
    Object.values(graph).forEach(node => {
      const lvl = node.level === -1 ? 0 : node.level;
      if (!levels[lvl]) levels[lvl] = [];
      levels[lvl].push(node);
    });

    // 4. Assign Coordinates
    let maxRowHeight = 0;
    
    levels.forEach((levelNodes, colIndex) => {
      // Center this column vertically relative to startY
      const columnHeight = levelNodes.length * Y_SPACING;
      const columnTop = startY - (columnHeight / 2);

      levelNodes.forEach((node, rowIndex) => {
        node.x = startX + (colIndex * X_SPACING);
        node.y = columnTop + (rowIndex * Y_SPACING);
      });
      
      // Track total height of this layout block
      if (columnHeight > maxRowHeight) maxRowHeight = columnHeight;
    });

    // 5. Map back to React Flow format
    const newPositions = subsetNodes.map(node => {
      const layout = graph[node.id];
      return {
        ...node,
        targetPosition: 'left',
        sourcePosition: 'right',
        position: { x: layout.x, y: layout.y }
      };
    });

    return { nodes: newPositions, height: maxRowHeight, maxY: startY + (maxRowHeight/2) };
  };

  // --- SPLIT LOGIC ---
  
  // 1. Separate Main Nodes vs Event Nodes
  const mainNodes = nodes.filter(n => !n.data?.isEventNode);
  const eventNodes = nodes.filter(n => n.data?.isEventNode);

  // 2. Layout Main Flow (Centered at 0,0)
  const layoutMain = layoutSubset(mainNodes, edges, 0, 0);

  // 3. Layout Event Flows
  // We place them strictly BELOW the Main Flow.
  // Calculate offset: finds the lowest point of Main flow + 400px padding
  let eventsOffsetY = 800; // Default gap
  if (mainNodes.length > 0) {
    // Find the max Y from the main layout result
    const maxY = Math.max(...layoutMain.nodes.map(n => n.position.y));
    eventsOffsetY = maxY + 600;
  }

  const layoutEvents = layoutSubset(eventNodes, edges, 0, eventsOffsetY);

  // 4. Combine
  return {
    nodes: [...layoutMain.nodes, ...layoutEvents.nodes],
    edges: edges
  };
};
