import { jsPDF } from 'jspdf';

self.onmessage = (e) => {
  const { images } = e.data;

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      compress: true,
    });

    images.forEach((image, index) => {
      if (index > 0) pdf.addPage();
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit page
      const ratio = Math.min(pdfWidth / image.width, pdfHeight / image.height);
      const w = image.width * ratio;
      const h = image.height * ratio;
      const x = (pdfWidth - w) / 2;
      const y = (pdfHeight - h) / 2;

      // Create Uint8Array from ArrayBuffer
      const data = new Uint8Array(image.data);
      
      // Add image to PDF
      pdf.addImage(data, 'PNG', x, y, w, h, null, 'FAST');

      // --- Add Invisible Text Layer ---
      if (image.textData && image.textData.length > 0) {
        // Set text to invisible rendering mode (Mode 3: Neither fill nor stroke)
        // This makes it selectable but invisible
        pdf.setTextRenderingMode(3); 
        
        // Calculate the scale factor from Logical Pixels (ReactFlow) to PDF Points
        // image.width is the 6x pixel width.
        // image.logicalWidth is the 1x logical width.
        // We placed the image at size (w, h) on the PDF.
        // So: PDF_Size = Logical_Size * ScaleFactor
        // ScaleFactor = w / image.logicalWidth
        
        const scaleFactor = w / image.logicalWidth;

        image.textData.forEach(item => {
            // Calculate PDF position
            // item.x/y are relative to the capture box (logical pixels)
            // We need to scale them and add the offset (x, y) where the image starts
            const pdfX = x + (item.x * scaleFactor);
            const pdfY = y + (item.y * scaleFactor);
            
            // Scale font size
            // ReactFlow font is px. PDF font is pt.
            // 1px approx 0.75pt, but we also scaled the whole image down by `ratio`.
            // Let's just scale by our calculated factor.
            const fontSize = item.fontSize * scaleFactor;

            pdf.setFontSize(fontSize);
            pdf.text(String(item.text), pdfX, pdfY);
        });
        
        // Reset rendering mode (good practice, though we are done with this page)
        pdf.setTextRenderingMode(0);
      }
    });

    const pdfBlob = pdf.output('blob');
    self.postMessage({ type: 'success', blob: pdfBlob });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
