import React, { useState, useEffect, useRef } from 'react';
import { useReactFlow, getRectOfNodes } from 'reactflow';
import { toBlob } from 'html-to-image';
// jsPDF is now imported in the worker
import PdfWorker from '../workers/pdfWorker.js?worker';

const DownloadButton = ({ setShowEvents, setIsCapturing }) => {
  const { getNodes } = useReactFlow();
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new PdfWorker();
    
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const downloadPdf = async () => {
    setIsDownloading(true);
    setIsCapturing(true);
    setStatusText('Preparing...');
    
    // Yield to UI
    await new Promise(r => setTimeout(r, 10));

    try {
      // 1. Ensure all nodes are visible (logic-wise)
      setShowEvents(true);
      
      // Allow time for React to render any hidden nodes
      await new Promise((resolve) => setTimeout(resolve, 500));

      const nodes = getNodes();
      const mainNodes = nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
      const eventNodes = nodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

      // Helper to capture a specific set of nodes
      const captureNodes = async (targetNodes, label) => {
        if (targetNodes.length === 0) return null;
        
        setStatusText(`Capturing ${label}...`);
        await new Promise(r => setTimeout(r, 50));

        // 1. Calculate the bounding box of the nodes
        const bounds = getRectOfNodes(targetNodes);
        
        // Add some padding
        const padding = 50;
        const width = bounds.width + (padding * 2);
        const height = bounds.height + (padding * 2);
        const startX = bounds.x - padding;
        const startY = bounds.y - padding;

        const viewportElem = document.querySelector('.react-flow__viewport');
        
        // 2. Define Tiling Strategy
        // Safe tile size (logical pixels)
        // If we want 4.0x resolution, max dimension is 16000 / 4 = 4000px
        const TILE_SIZE = 2000; // 2000 * 4 = 8000px physical size (very safe)
        const PIXEL_RATIO = 4.0;

        const cols = Math.ceil(width / TILE_SIZE);
        const rows = Math.ceil(height / TILE_SIZE);
        
        const tiles = [];

        // 3. Capture Tiles
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const tileX = startX + (col * TILE_SIZE);
                const tileY = startY + (row * TILE_SIZE);
                
                // Calculate current tile width/height (might be smaller at edges)
                const currentTileW = Math.min(TILE_SIZE, width - (col * TILE_SIZE));
                const currentTileH = Math.min(TILE_SIZE, height - (row * TILE_SIZE));

                // Move viewport to bring this tile to (0,0)
                // We use the transform style to shift the viewport
                // Note: html-to-image captures the element's content. 
                // We need to shift the content so the top-left of our tile is at (0,0) of the capture area.
                
                const blob = await toBlob(viewportElem, {
                    backgroundColor: '#ffffff',
                    width: currentTileW,
                    height: currentTileH,
                    style: {
                        width: currentTileW + 'px',
                        height: currentTileH + 'px',
                        // Shift content: -tileX, -tileY
                        transform: `translate(${-tileX}px, ${-tileY}px) scale(1)`
                    },
                    pixelRatio: PIXEL_RATIO
                });

                if (blob) {
                    const buffer = await blob.arrayBuffer();
                    tiles.push({
                        data: buffer,
                        x: (col * TILE_SIZE) * PIXEL_RATIO, // Physical PDF position (if PDF unit is px)
                        y: (row * TILE_SIZE) * PIXEL_RATIO,
                        width: currentTileW * PIXEL_RATIO,
                        height: currentTileH * PIXEL_RATIO
                    });
                }
                
                // Yield to UI occasionally
                if (tiles.length % 4 === 0) await new Promise(r => setTimeout(r, 10));
            }
        }

        return {
            width: width * PIXEL_RATIO,
            height: height * PIXEL_RATIO,
            tiles: tiles
        };
      };

      // --- Page 1: Main Flow ---
      const pages = [];
      if (mainNodes.length > 0) {
        const page1 = await captureNodes(mainNodes, 'Main Flow');
        if (page1) pages.push(page1);
      }
      
      // --- Page 2: Event Flows ---
      if (eventNodes.length > 0) {
        const page2 = await captureNodes(eventNodes, 'Event Flows');
        if (page2) pages.push(page2);
      }

      setStatusText('Generating PDF...');
      
      // Unfreeze UI immediately after capture
      setIsCapturing(false);

      // Send to worker
      workerRef.current.postMessage({ pages });

      // Wait for worker response
      await new Promise((resolve, reject) => {
        const handler = (e) => {
          if (e.data.type === 'success') {
            const url = URL.createObjectURL(e.data.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flow-visualizer-export.pdf';
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          } else if (e.data.type === 'error') {
            reject(new Error(e.data.error));
          }
          // Remove listener after one response
          workerRef.current.removeEventListener('message', handler);
        };
        workerRef.current.addEventListener('message', handler);
      });

      setStatusText('Done!');
      await new Promise(r => setTimeout(r, 500));

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. See console for details.');
    } finally {
      setIsDownloading(false);
      // Ensure it's false in case of error
      setIsCapturing(false);
      setStatusText('');
    }
  };

  return (
    <button 
      onClick={downloadPdf}
      disabled={isDownloading}
      style={{
        background: isDownloading ? '#f5f5f5' : 'white',
        border: '1px solid #ccc',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: isDownloading ? 'default' : 'pointer', // Don't show wait cursor
        fontWeight: 'bold',
        color: isDownloading ? '#888' : '#000000', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '140px', // Prevent layout jump when text changes
        justifyContent: 'center'
      }}
    >
      <span>{isDownloading ? '⏳' : '📄'}</span> 
      {isDownloading ? statusText : 'Export PDF'}
    </button>
  );
};

export default DownloadButton;
