/**
 * DownloadButton.jsx — PDF Export Button Component
 *
 * This component provides the "Export PDF" button in the flow visualizer toolbar.
 * When clicked, it:
 *   1. Separates the current React Flow nodes into main flow and event flow groups
 *   2. Simplifies each node/edge into a serializable data structure (stripping
 *      React-specific properties that can't be sent to a Web Worker)
 *   3. Sends the prepared data to a Web Worker (pdfWorker.js) for off-thread
 *      PDF generation, keeping the UI responsive
 *   4. Receives the completed PDF blob back and triggers a browser download
 *
 * Props:
 *   - nodes: Array of React Flow node objects (from useNodes or state)
 *   - edges: Array of React Flow edge objects (from useEdges or state)
 */

import React, { useState, useEffect, useRef } from 'react';
import { getNodeConfig } from '../wxccConfig';
import PdfWorker from '../workers/pdfWorker.js?worker';

const DownloadButton = ({ nodes, edges }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const workerRef = useRef(null);

  // Initialize the Web Worker on mount; terminate on unmount to free resources
  useEffect(() => {
    workerRef.current = new PdfWorker();
    return () => { workerRef.current?.terminate(); };
  }, []);

  const downloadPdf = async () => {
    setIsDownloading(true);
    setStatusText('Preparing...');
    // Yield to the event loop so the status text renders before heavy work begins
    await new Promise(r => setTimeout(r, 10));

    try {
      // Split nodes into main flow (non-event) and event flow (event + group headers)
      const mainNodes = nodes.filter(n => !n.data?.isEventNode && n.type !== 'groupHeader');
      const eventNodes = nodes.filter(n => n.data?.isEventNode || n.type === 'groupHeader');

      /**
       * Convert React Flow nodes into a simplified format for the worker.
       * Strips React component references and extracts only the data needed
       * for vector PDF rendering: position, colors, labels, and raw details.
       */
      const prepareNodes = (list) => list.map(n => {
        // Group headers (e.g. "Event: GLOBAL_EVENTS") are rendered as simple text dividers
        if (n.type === 'groupHeader') {
          return {
            id: n.id, x: n.position.x, y: n.position.y,
            type: 'groupHeader', label: n.data.label, isGroupHeader: true,
            headerColor: '#E0E0E0', borderColor: '#BDBDBD', fontColor: '#292929',
            subtitle: '', details: {},
          };
        }
        // Regular nodes: look up their visual config (colors, type label) from wxccConfig
        const config = getNodeConfig(n.data.nodeType);
        return {
          id: n.id, x: n.position.x, y: n.position.y,
          type: config.nodeType,
          label: n.data.label,
          subtitle: config.label,
          headerColor: config.header,
          borderColor: config.border,
          fontColor: config.font || '#292929',
          details: n.data.details || {},
        };
      });

      /**
       * Filter edges to only those connecting nodes within the given set,
       * and simplify to just the fields needed for PDF rendering.
       */
      const prepareEdges = (nodeIds, allEdges) => {
        const idSet = new Set(nodeIds);
        return allEdges
          .filter(e => idSet.has(e.source) && idSet.has(e.target))
          .map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            color: e.style?.stroke || '#555',
          }));
      };

      setStatusText('Building PDF...');
      await new Promise(r => setTimeout(r, 10));

      const mainIds = mainNodes.map(n => n.id);
      const eventIds = eventNodes.map(n => n.id);

      // Build the pages array: one entry per flow (main + event), filtered to non-empty
      const pages = [
        { nodes: prepareNodes(mainNodes), edges: prepareEdges(mainIds, edges) },
        { nodes: prepareNodes(eventNodes), edges: prepareEdges(eventIds, edges) },
      ].filter(p => p.nodes.length > 0);

      // Send data to the Web Worker for off-thread PDF generation
      workerRef.current.postMessage({ pages });

      // Wait for the worker to respond with the completed PDF blob or an error
      await new Promise((resolve, reject) => {
        const handler = (e) => {
          workerRef.current.removeEventListener('message', handler);
          if (e.data.type === 'success') {
            // Create a temporary download link and trigger the browser save dialog
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
        cursor: isDownloading ? 'default' : 'pointer',
        fontWeight: 'bold',
        color: isDownloading ? '#888' : '#000000',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '140px',
        justifyContent: 'center',
      }}
    >
      <span>{isDownloading ? '⏳' : '📄'}</span>
      {isDownloading ? statusText : 'Export PDF'}
    </button>
  );
};

export default DownloadButton;
