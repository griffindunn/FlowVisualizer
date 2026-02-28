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
      if (image.textData && image.textData.length > 0 && image.logicalWidth > 0) {
        // Calculate the scale factor from Logical Pixels (ReactFlow) to PDF Points
        // image.width is the 6x pixel width.
        // image.logicalWidth is the 1x logical width.
        // We placed the image at size (w, h) on the PDF.
        // So: PDF_Size = Logical_Size * ScaleFactor
        // ScaleFactor = w / image.logicalWidth
        
        const scaleFactor = w / image.logicalWidth;

        // Try to set rendering mode to invisible (3)
        // If API is missing, we skip the invisible text to prevent crash
        let canRenderText = false;
        try {
            if (typeof pdf.setTextRenderingMode === 'function') {
                pdf.setTextRenderingMode(3); // 3 = Invisible
                canRenderText = true;
            } else if (pdf.internal && pdf.internal.write) {
                pdf.internal.write('3 Tr'); // Raw PDF operator
                canRenderText = true;
            } else {
                console.warn('setTextRenderingMode not supported');
            }
        } catch (e) {
            console.warn('Error setting text rendering mode:', e);
        }

        if (canRenderText) {
            image.textData.forEach(item => {
                try {
                    // Calculate PDF position
                    const pdfX = x + (item.x * scaleFactor);
                    const pdfY = y + (item.y * scaleFactor);
                    
                    const fontSize = item.fontSize * scaleFactor;

                    // Ensure valid numbers
                    if (!isNaN(pdfX) && !isNaN(pdfY) && !isNaN(fontSize)) {
                        pdf.setFontSize(fontSize);
                        pdf.text(String(item.text), pdfX, pdfY);
                    }
                } catch (err) {
                    // Ignore individual text errors
                }
            });
            
            // Reset rendering mode
            try {
                if (typeof pdf.setTextRenderingMode === 'function') {
                    pdf.setTextRenderingMode(0);
                } else if (pdf.internal && pdf.internal.write) {
                    pdf.internal.write('0 Tr');
                }
            } catch (e) {}
        }
      }
    });

    const pdfBlob = pdf.output('blob');
    self.postMessage({ type: 'success', blob: pdfBlob });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message || 'Unknown PDF generation error' });
  }
};
