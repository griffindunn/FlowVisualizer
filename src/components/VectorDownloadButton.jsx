import React, { useState } from 'react';
import { useReactFlow, getRectOfNodes } from 'reactflow';
import { jsPDF } from 'jspdf';
import { getNodeConfig, getValidExits } from '../wxccConfig';

const VectorDownloadButton = ({ setShowEvents }) => {
  const { getNodes, getEdges } = useReactFlow();
  const [isExporting, setIsExporting] = useState(false);

  const exportVectorPdf = async () => {
    setIsExporting(true);
    
    // 1. Ensure all nodes are visible
    setShowEvents(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const nodes = getNodes();
    const edges = getEdges();
    
    const mainNodes = nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
    const eventNodes = nodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt', // Use points for easier mapping
    });

    const drawFlowToPage = (targetNodes) => {
      if (targetNodes.length === 0) return;

      const bounds = getRectOfNodes(targetNodes);
      const padding = 50;
      
      // PDF Page Dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate Scale to fit
      const contentWidth = bounds.width + (padding * 2);
      const contentHeight = bounds.height + (padding * 2);
      
      const scaleX = pageWidth / contentWidth;
      const scaleY = pageHeight / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up if smaller
      
      // Center content
      const finalWidth = contentWidth * scale;
      const finalHeight = contentHeight * scale;
      const offsetX = (pageWidth - finalWidth) / 2;
      const offsetY = (pageHeight - finalHeight) / 2;

      // Transform helper
      const transform = (x, y) => {
        return {
          x: (x - bounds.x + padding) * scale + offsetX,
          y: (y - bounds.y + padding) * scale + offsetY
        };
      };

      // --- DRAW EDGES ---
      pdf.setLineWidth(1.5 * scale);
      
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return;
        
        // Check if edge belongs to current set
        const isRelevant = targetNodes.some(n => n.id === sourceNode.id || n.id === targetNode.id);
        if (!isRelevant) return;

        // --- Calculate Exact Handle Positions ---
        
        // Target Handle: Fixed at Top-Leftish (based on CSS: top 24px)
        const targetX = targetNode.position.x; 
        const targetY = targetNode.position.y + 24;

        // Source Handle: Depends on the specific exit
        // Construct the full list of handles for this node type to find the index
        const nodeType = sourceNode.data?.nodeType;
        const config = getNodeConfig(nodeType);
        const validExits = getValidExits(nodeType);
        
        let allHandles = [];
        
        // 1. Dynamic Handles (Menu/Case)
        if (config.nodeType === 'MenuNode') {
            const choices = sourceNode.data?.details?.choices || [];
            choices.forEach(c => allHandles.push(c.id));
        } else if (config.nodeType === 'CaseNode') {
            const cases = sourceNode.data?.details?.cases || [];
            cases.forEach(c => allHandles.push(c.id));
        } else {
            // 2. Default Handle (for non-branching nodes)
            // Most nodes have a 'success' or 'default' path first
            // Exclude Terminating nodes that might not have a default path
            // But Transfer/Handoff usually DO have a 'connected' or implicit success path before errors
            // DisconnectNode has NO exits.
            if (config.nodeType !== 'DisconnectNode') {
                 allHandles.push('default');
            }
        }

        // 3. Standard Exits (Error, Timeout, etc.)
        // Note: getValidExits returns an array like ['timeout', 'error'].
        // We need to check if the edge handle is one of these.
        // But we also pushed 'default' above.
        // So allHandles might be ['choice1', 'choice2', 'default', 'timeout', 'error'].
        // Or ['default', 'error'].
        // We need to find the index of edge.sourceHandle in this combined list.
        
        // Wait, getValidExits returns the *extra* handles.
        // But edge.sourceHandle might be 'timeout', 'error', etc.
        // So we need to add them to allHandles.
        // But we need to make sure we don't duplicate if they were already added (unlikely for standard nodes).
        
        validExits.forEach(exit => {
            if (!allHandles.includes(exit)) {
                allHandles.push(exit);
            }
        });

        // Find index
        let exitIndex = allHandles.indexOf(edge.sourceHandle);
        
        // Fallback: If not found, try to find 'default' or 0
        if (exitIndex === -1) {
             // If edge handle is 'default', and we didn't add 'default' to allHandles (e.g. MenuNode),
             // then we should probably treat it as index 0 or similar.
             // But MenuNode shouldn't have 'default'.
             // If it's a simple node, we added 'default'.
             // If it's SetVariableNode, we added 'default'.
             // If it's DisconnectNode, we didn't add 'default'.
             // If edge handle is 'error', and it's in validExits, we should have found it.
             
             // Maybe edge handle is 'success' but we pushed 'default'?
             // processWxccJson.js maps happy paths to 'default' for simple nodes.
             // So edge.sourceHandle IS 'default'.
             // And we pushed 'default'.
             // So it should be found.
             
             // If not found, default to 0.
             exitIndex = 0;
        }

        // Header is 48px. Each exit row is 24px. Handle is centered in row (+12px).
        // Note: Some nodes might have extra content (assignments) pushing handles down.
        // We can't easily know the height of that content.
        // Approximation: 
        // If SetVariableNode, add some padding? 
        // For now, we assume handles start immediately after header for most, 
        // or we just accept they might be slightly off vertically.
        // Actually, SetVariableNode has assignments, THEN handles.
        // This is a limitation of vector export without full layout engine.
        // We will just add a fixed offset for body content if it's SetVariable.
        
        let bodyContentOffset = 0;
        if (config.nodeType === 'SetVariableNode') {
            // Estimate height of assignments
            const assignments = sourceNode.data?.details?.setVariablesArray || (sourceNode.data?.details?.srcVariable ? [1] : []);
            // Each assignment is roughly 12px high + 2px margin.
            // Header: 20px (Assignments label) + assignments * 14px + 4px (margin)
            bodyContentOffset = 20 + (assignments.length * 14) + 4; 
        }

        const sourceX = sourceNode.position.x + (sourceNode.width || 280);
        const sourceY = sourceNode.position.y + 48 + bodyContentOffset + (exitIndex * 24) + 12;

        // Transform to PDF coordinates
        const start = transform(sourceX, sourceY);
        const end = transform(targetX, targetY);

        // Set Color
        const isError = edge.data?.isRedLine;
        if (isError) {
          pdf.setDrawColor(211, 47, 47); // Red
        } else {
          pdf.setDrawColor(85, 85, 85); // Grey
        }

        // --- Draw Curve ---
        // Logic from CurvedLoopEdge.jsx
        
        // Check for backward loop
        // Note: We use raw coordinates for logic, then transformed for drawing
        const isBackward = targetX < sourceX + 50;

        if (isBackward) {
            // Loop Logic: Curve UP and OVER
            const highestY = Math.min(sourceY, targetY);
            const loopHeight = 80;
            
            const c1x = sourceX + 80;
            const c1y = highestY - loopHeight;
            const c2x = targetX - 80;
            const c2y = highestY - loopHeight;

            const tC1 = transform(c1x, c1y);
            const tC2 = transform(c2x, c2y);

            pdf.moveTo(start.x, start.y);
            pdf.curveTo(tC1.x, tC1.y, tC2.x, tC2.y, end.x, end.y);
        } else {
            // Forward Logic: Standard Bezier
            // curvature 0.35 approx
            const dist = Math.abs(targetX - sourceX);
            const controlOffset = dist * 0.35; 
            
            const c1x = sourceX + controlOffset;
            const c1y = sourceY;
            const c2x = targetX - controlOffset;
            const c2y = targetY;

            const tC1 = transform(c1x, c1y);
            const tC2 = transform(c2x, c2y);

            pdf.moveTo(start.x, start.y);
            pdf.curveTo(tC1.x, tC1.y, tC2.x, tC2.y, end.x, end.y);
        }
      });

      // --- DRAW NODES ---
      targetNodes.forEach(node => {
        if (node.type === 'groupHeader') {
           const pos = transform(node.position.x, node.position.y);
           pdf.setFontSize(24 * scale);
           pdf.setTextColor(100);
           pdf.text(node.data.label, pos.x, pos.y);
           return;
        }

        const { x, y } = transform(node.position.x, node.position.y);
        const w = (node.width || 280) * scale;
        const h = (node.height || 100) * scale; 

        const config = getNodeConfig(node.data?.nodeType);
        
        // Header
        pdf.setFillColor(config.header); 
        pdf.setDrawColor(0); 
        pdf.setLineWidth(0.5 * scale);
        
        const headerHeight = 48 * scale;
        const radius = 8 * scale;

        // Draw Header (Rounded Top)
        // We draw a rounded rect for the whole top, then fill the bottom half to make it square at bottom
        // Or just use lines/curves manually. 
        // Easier: Draw rounded rect for whole header, then rect for bottom half to cover corners?
        // Actually, jsPDF roundedRect applies to all corners.
        // Let's draw the whole node background first as a rounded rect (body color), then draw header on top?
        // No, header is different color.
        
        // Strategy: Draw whole shape as rounded rect with Body Color.
        // Then Clip to top area and draw Header Color?
        // Simple approach: Draw Header Rounded Rect, then fill bottom part of it with straight rect to "unround" it?
        // Let's try:
        
        // 1. Header (Rounded Top)
        pdf.setFillColor(config.header);
        pdf.roundedRect(x, y, w, headerHeight + radius, radius, radius, 'F'); // Draw slightly taller
        // 2. Fix bottom of header (square it off)
        pdf.rect(x, y + headerHeight - radius, w, radius * 2, 'F'); // Cover the bottom rounded corners
        
        // 3. Body (Rounded Bottom)
        pdf.setFillColor(255, 255, 255);
        // Draw body starting at header bottom
        const bodyY = y + headerHeight;
        const bodyH = h - headerHeight;
        pdf.roundedRect(x, bodyY - radius, w, bodyH + radius, radius, radius, 'F');
        // Fix top of body (square it off)
        pdf.rect(x, bodyY - radius, w, radius, 'F');

        // 4. Outline (Whole Node)
        pdf.setDrawColor(0);
        pdf.roundedRect(x, y, w, h, radius, radius, 'S'); // Stroke only
        
        // 5. Divider Line
        pdf.setDrawColor(config.border);
        pdf.line(x, y + headerHeight, x + w, y + headerHeight);

        // Draw Text
        pdf.setTextColor(0);
        pdf.setFontSize(12 * scale);
        // Title
        const title = node.data?.label || 'Node';
        pdf.text(title, x + (10 * scale), y + (30 * scale));
        
        // Subtitle
        pdf.setFontSize(9 * scale);
        pdf.setTextColor(80);
        pdf.text(config.label, x + (10 * scale), y + (42 * scale));

        // Body Text (Details)
        if (node.data?.details) {
            let lineY = y + headerHeight + (15 * scale);
            const details = node.data.details;
            Object.keys(details).slice(0, 5).forEach(key => {
                if (key === 'activityName') return;
                const val = String(details[key]).substring(0, 35);
                pdf.text(`${key}: ${val}`, x + (10 * scale), lineY);
                lineY += (12 * scale);
            });
        }
      });
    };

    // Page 1
    if (mainNodes.length > 0) {
        drawFlowToPage(mainNodes);
    }

    // Page 2
    if (eventNodes.length > 0) {
        if (mainNodes.length > 0) pdf.addPage();
        drawFlowToPage(eventNodes);
    }

    pdf.save('flow-visualizer-vector-test.pdf');
    setIsExporting(false);
  };

  return (
    <button 
      onClick={exportVectorPdf}
      disabled={isExporting}
      style={{
        background: isExporting ? '#f0f0f0' : 'white',
        border: '1px solid #ccc',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#333',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span>{isExporting ? '⏳' : '🔤'}</span> 
      Test Vector Export
    </button>
  );
};

export default VectorDownloadButton;
