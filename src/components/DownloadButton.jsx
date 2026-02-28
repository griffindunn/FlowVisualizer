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
        // Yield to UI before heavy task
        await new Promise(r => setTimeout(r, 50));

        // 1. Calculate the bounding box of the nodes
        const bounds = getRectOfNodes(targetNodes);
        
        // Add some padding
        const padding = 50;
        const width = bounds.width + (padding * 2);
        const height = bounds.height + (padding * 2);
        const x = bounds.x - padding;
        const y = bounds.y - padding;

        // 2. Select the viewport element (contains nodes/edges, but NO controls/panels)
        const viewportElem = document.querySelector('.react-flow__viewport');
        
        // 3. Calculate safe pixel ratio
        const SAFE_LIMIT = 16000; // Conservative limit
        let ratio = 4.0; // Target high quality
        
        // Check if we exceed limit
        if (width * ratio > SAFE_LIMIT) {
            ratio = SAFE_LIMIT / width;
        }
        if (height * ratio > SAFE_LIMIT) {
            const hRatio = SAFE_LIMIT / height;
            if (hRatio < ratio) ratio = hRatio;
        }
        
        // Don't go below 1.0 if possible
        ratio = Math.max(ratio, 1.0);
        
        // 4. Capture
        const blob = await toBlob(viewportElem, {
             backgroundColor: '#ffffff',
             width: width,
             height: height,
             style: {
                 width: width + 'px',
                 height: height + 'px',
                 transform: `translate(${-x}px, ${-y}px) scale(1)`
             },
             pixelRatio: ratio
        });

        if (!blob) return null;

        // Convert Blob to ArrayBuffer for transfer to worker
        const buffer = await blob.arrayBuffer();
        
        return {
          data: buffer,
          width: width * ratio,
          height: height * ratio
        };
      };

      // --- Page 1: Main Flow ---
      const images = [];
      if (mainNodes.length > 0) {
        const img1 = await captureNodes(mainNodes, 'Main Flow');
        if (img1) images.push(img1);
      }
      
      // --- Page 2: Event Flows ---
      if (eventNodes.length > 0) {
        const img2 = await captureNodes(eventNodes, 'Event Flows');
        if (img2) images.push(img2);
      }

      setStatusText('Generating PDF...');
      
      // Unfreeze UI immediately after capture
      setIsCapturing(false);

      // Send to worker
      workerRef.current.postMessage({ images });

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
