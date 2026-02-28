import { jsPDF } from 'jspdf';

// ============================================================
// CONSTANTS
// ============================================================
const NODE_W = 280;
const HEADER_H = 48;
const ROW_H = 24;
const SEP_H = 13;
const MIN_BODY_H = 40;
const CORNER_R = 8;
const HANDLE_R = 5;

const SECTION_LABEL_H = 20;
const TEXT_LINE_H = 20;
const ASSIGNMENT_H = 14;
const EXPR_BOX_H = 30;
const MSG_BOX_H = 40;
const BADGE_H = 30;

// ============================================================
// COLOR HELPERS
// ============================================================
function parseColor(color) {
  if (!color) return [0, 0, 0];
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      return [parseInt(hex[0]+hex[0],16), parseInt(hex[1]+hex[1],16), parseInt(hex[2]+hex[2],16)];
    }
    return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
  }
  const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  return [0, 0, 0];
}

function setFill(pdf, color) { const c = parseColor(color); pdf.setFillColor(c[0], c[1], c[2]); }
function setDraw(pdf, color) { const c = parseColor(color); pdf.setDrawColor(c[0], c[1], c[2]); }
function setText(pdf, color) { const c = parseColor(color); pdf.setTextColor(c[0], c[1], c[2]); }

// ============================================================
// NODE BLUEPRINT: Determines body content and exit handles
// ============================================================
function getNodeBlueprint(type, details) {
  const body = [];
  const exits = [];

  switch (type) {
    case 'StartNode':
      exits.push({ id: 'default', label: 'Start', color: '#444' });
      break;

    case 'MenuNode': {
      body.push({ type: 'sectionLabel', text: 'Choices' });
      (details.choices || []).forEach(c => {
        exits.push({ id: c.id, label: c.label, color: '#444', badge: String(c.id) });
      });
      exits.push({ id: 'timeout', label: 'No-Input Timeout', color: '#999', sep: true });
      exits.push({ id: 'invalid', label: 'Unmatched Entry', color: '#999' });
      exits.push({ id: 'error', label: 'Undefined Error', color: '#999' });
      break;
    }

    case 'CaseNode': {
      body.push({ type: 'sectionLabel', text: 'Cases' });
      (details.cases || []).forEach(c => {
        exits.push({ id: c.id, label: c.label, color: '#444' });
      });
      exits.push({ id: 'default', label: 'Default', color: '#444', sep: true });
      exits.push({ id: 'error', label: 'Undefined Error', color: '#D32F2F' });
      break;
    }

    case 'ConditionNode':
      body.push({ type: 'exprBox', text: details.expression || 'Condition Expression' });
      exits.push({ id: 'true', label: 'True', color: '#444', sep: true });
      exits.push({ id: 'false', label: 'False', color: '#444' });
      exits.push({ id: 'error', label: 'Undefined Error', color: '#D32F2F' });
      break;

    case 'BusinessHoursNode':
      body.push({ type: 'text', text: 'Check Schedule', color: '#555' });
      exits.push({ id: 'workingHours', label: 'Working Hours', color: '#444' });
      exits.push({ id: 'holiday', label: 'Holidays', color: '#444' });
      exits.push({ id: 'override', label: 'Override', color: '#E65100' });
      exits.push({ id: 'default', label: 'Default', color: '#444' });
      exits.push({ id: 'error', label: 'Undefined Error', color: '#D32F2F', sep: true });
      break;

    case 'CollectDigitsNode':
      body.push({ type: 'labelVal', label: 'Store In', value: details.variable || 'Digits' });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      exits.push({ id: 'timeout', label: 'No-Input Timeout', color: '#999', sep: true });
      exits.push({ id: 'interrupted', label: 'Unmatched Entry', color: '#999' });
      exits.push({ id: 'error', label: 'Undefined Error', color: '#999' });
      break;

    case 'PlayMessageNode': {
      let msg = 'No message configured';
      if (details.promptsTts && details.promptsTts[0]) msg = details.promptsTts[0].value || details.promptsTts[0].name || msg;
      else if (details.prompts && details.prompts[0]) msg = details.prompts[0].value || details.prompts[0].name || msg;
      else if (details.message) msg = details.message;
      body.push({ type: 'msgBox', text: msg });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      exits.push({ id: 'error', label: 'Undefined Error', color: '#999', sep: true });
      break;
    }

    case 'PlayMusicNode':
      body.push({ type: 'text', text: details.audioFile || 'Default Audio', color: '#555', italic: true });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      exits.push({ id: 'error', label: 'Error', color: '#D32F2F' });
      break;

    case 'SetVariableNode': {
      body.push({ type: 'sectionLabel', text: 'Assignments' });
      let assigns = [];
      if (Array.isArray(details.setVariablesArray) && details.setVariablesArray.length > 0) assigns = details.setVariablesArray;
      else if (details.srcVariable) assigns = [details];
      if (assigns.length > 0) {
        assigns.forEach(a => {
          body.push({ type: 'assign', variable: a.srcVariable || '?', value: String(a.expr || a.literal || a.tgtVariable || 'null').substring(0, 30) });
        });
      } else {
        body.push({ type: 'text', text: 'No variables set', color: '#bbb', italic: true });
      }
      exits.push({ id: 'default', label: 'Success', color: '#444', sep: true });
      exits.push({ id: 'error', label: 'Undefined Error', color: '#D32F2F' });
      break;
    }

    case 'ParseNode':
      body.push({ type: 'labelVal', label: 'Input', value: details.inputVariable || 'N/A' });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      break;

    case 'HTTPRequestNode':
      body.push({ type: 'bold', text: details.httpRequestMethod || 'GET' });
      body.push({ type: 'text', text: (details.httpRequestUrl || 'http://...').substring(0, 40), color: '#555' });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      break;

    case 'BRERequestNode':
      body.push({ type: 'text', text: 'BRE Execution', color: '#555' });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      break;

    case 'FunctionNode':
      body.push({ type: 'bold', text: details.functionName || 'Custom Function' });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      exits.push({ id: 'error', label: 'Error', color: '#D32F2F' });
      break;

    case 'QueueContactNode':
      body.push({ type: 'bold', text: details.queueName || 'Target Queue', color: '#005073' });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      exits.push({ id: 'failure', label: 'Failure', color: '#D32F2F' });
      break;

    case 'QueueLookupNode':
      body.push({ type: 'text', text: 'Get Queue Stats', color: '#555' });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      exits.push({ id: 'insufficient_data', label: 'Insufficient Data', color: '#999' });
      exits.push({ id: 'failure', label: 'Failure', color: '#D32F2F' });
      break;

    case 'TransferNode':
      body.push({ type: 'bold', text: details.destination || 'Destination', color: '#005073' });
      exits.push({ id: 'default', label: 'Connected', color: '#444' });
      exits.push({ id: 'busy', label: 'Busy', color: '#999', sep: true });
      exits.push({ id: 'no_answer', label: 'No Answer', color: '#999' });
      exits.push({ id: 'invalid', label: 'Invalid', color: '#999' });
      exits.push({ id: 'error', label: 'Error', color: '#D32F2F' });
      break;

    case 'HandoffNode': {
      const dest = details.handOffFlow?.handOffToName || details.handOffFlow?.handOffTo || 'Target Flow';
      body.push({ type: 'labelVal', label: 'Go To', value: dest, valColor: '#005073' });
      break;
    }

    case 'SubflowNode':
      body.push({ type: 'bold', text: details.subflowName || 'Subflow', color: '#005073' });
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      exits.push({ id: 'error', label: 'Error', color: '#D32F2F' });
      break;

    case 'DisconnectNode':
      body.push({ type: 'badge', text: 'End of Flow', bg: '#FFEBEE', fg: '#D32F2F' });
      break;

    default:
      exits.push({ id: 'default', label: 'Success', color: '#444' });
      exits.push({ id: 'error', label: 'Error', color: '#D32F2F' });
      break;
  }

  return { body, exits };
}

// ============================================================
// LAYOUT CALCULATOR: Computes total height + handle positions
// ============================================================
function calculateLayout(type, details) {
  const { body, exits } = getNodeBlueprint(type, details);
  let cursor = HEADER_H;
  const handles = {};

  body.forEach(item => {
    const heights = { sectionLabel: SECTION_LABEL_H, text: TEXT_LINE_H, bold: TEXT_LINE_H, labelVal: TEXT_LINE_H, assign: ASSIGNMENT_H, exprBox: EXPR_BOX_H, msgBox: MSG_BOX_H, badge: BADGE_H };
    cursor += heights[item.type] || TEXT_LINE_H;
  });

  exits.forEach(exit => {
    if (exit.sep) cursor += SEP_H;
    handles[exit.id] = cursor + ROW_H / 2;
    cursor += ROW_H;
  });

  if (cursor - HEADER_H < MIN_BODY_H) {
    const diff = MIN_BODY_H - (cursor - HEADER_H);
    Object.keys(handles).forEach(k => { handles[k] += diff; });
    cursor += diff;
  }

  return { totalHeight: cursor, handles, body, exits };
}

// ============================================================
// NODE DRAWING
// ============================================================
function drawNode(pdf, n) {
  const { x, y, totalHeight: h, headerColor, borderColor, fontColor, label, subtitle, body, exits, type } = n;
  const w = NODE_W;
  const r = CORNER_R;

  // --- Background ---
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, r, r, 'F');

  // --- Header fill (rounded top only) ---
  setFill(pdf, headerColor);
  pdf.roundedRect(x, y, w, HEADER_H + r, r, r, 'F');
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y + HEADER_H, w, r, 'F');

  // --- Header divider ---
  setDraw(pdf, borderColor);
  pdf.setLineWidth(0.5);
  pdf.line(x, y + HEADER_H, x + w, y + HEADER_H);

  // --- Outline ---
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);
  pdf.roundedRect(x, y, w, h, r, r, 'S');

  // --- Header text ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  setText(pdf, fontColor);
  pdf.text(String(label || '').substring(0, 32), x + 12, y + 22);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(11);
  pdf.setTextColor(85, 85, 85);
  pdf.text(subtitle || '', x + 12, y + 38);

  // --- Body content ---
  let cursor = y + HEADER_H;

  body.forEach(item => {
    switch (item.type) {
      case 'sectionLabel':
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(170, 170, 170);
        pdf.text(item.text.toUpperCase(), x + 12, cursor + 14);
        cursor += SECTION_LABEL_H;
        break;

      case 'text':
        pdf.setFont('helvetica', item.italic ? 'italic' : 'normal');
        pdf.setFontSize(11);
        setText(pdf, item.color || '#555');
        pdf.text(String(item.text).substring(0, 42), x + 12, cursor + 14);
        cursor += TEXT_LINE_H;
        break;

      case 'bold':
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        setText(pdf, item.color || '#292929');
        pdf.text(String(item.text).substring(0, 38), x + 12, cursor + 14);
        cursor += TEXT_LINE_H;
        break;

      case 'labelVal': {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(170, 170, 170);
        const lbl = item.label + ':';
        pdf.text(lbl, x + 12, cursor + 14);
        const lw = pdf.getTextWidth(lbl) + 4;
        pdf.setFont('helvetica', 'bold');
        setText(pdf, item.valColor || '#005073');
        pdf.text(String(item.value).substring(0, 30), x + 12 + lw, cursor + 14);
        cursor += TEXT_LINE_H;
        break;
      }

      case 'assign': {
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 80, 115);
        const vt = String(item.variable).substring(0, 18);
        pdf.text(vt, x + 12, cursor + 10);
        const vw = pdf.getTextWidth(vt);
        pdf.setFont('courier', 'normal');
        pdf.setTextColor(153, 153, 153);
        pdf.text(' = ', x + 12 + vw, cursor + 10);
        const ew = pdf.getTextWidth(' = ');
        pdf.setTextColor(230, 81, 0);
        pdf.text(String(item.value), x + 12 + vw + ew, cursor + 10);
        cursor += ASSIGNMENT_H;
        break;
      }

      case 'exprBox':
        pdf.setFillColor(249, 249, 249);
        pdf.setDrawColor(238, 238, 238);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(x + 12, cursor + 4, w - 24, EXPR_BOX_H - 8, 4, 4, 'FD');
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(133, 133, 133);
        pdf.text(String(item.text).substring(0, 42), x + 16, cursor + 18);
        cursor += EXPR_BOX_H;
        break;

      case 'msgBox':
        pdf.setFillColor(225, 245, 254);
        pdf.setDrawColor(179, 229, 252);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(x + 12, cursor + 4, w - 24, MSG_BOX_H - 8, 4, 4, 'FD');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(2, 119, 189);
        pdf.text(String(item.text).substring(0, 45), x + 16, cursor + 18);
        cursor += MSG_BOX_H;
        break;

      case 'badge': {
        setFill(pdf, item.bg);
        pdf.roundedRect(x + 40, cursor + 4, w - 80, BADGE_H - 8, 10, 10, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        setText(pdf, item.fg);
        const bw = pdf.getTextWidth(item.text);
        pdf.text(item.text, x + w / 2 - bw / 2, cursor + 18);
        cursor += BADGE_H;
        break;
      }
    }
  });

  // --- Exit rows ---
  exits.forEach(exit => {
    if (exit.sep) {
      pdf.setDrawColor(238, 238, 238);
      pdf.setLineWidth(0.5);
      pdf.line(x, cursor + SEP_H / 2, x + w, cursor + SEP_H / 2);
      cursor += SEP_H;
    }

    // Badge for menu/case choices
    if (exit.badge) {
      pdf.setDrawColor(204, 204, 204);
      pdf.setFillColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      const badgeTxt = exit.badge;
      const btw = pdf.getTextWidth(badgeTxt);
      const bw = Math.max(18, btw + 8);
      const bx = x + 12;
      pdf.roundedRect(bx, cursor + 3, bw, 18, 9, 9, 'FD');
      pdf.setTextColor(85, 85, 85);
      pdf.text(badgeTxt, bx + bw / 2, cursor + 15, { align: 'center' });
    }

    // Exit label (right-aligned before handle)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    setText(pdf, exit.color);
    pdf.text(exit.label, x + w - 20, cursor + 16, { align: 'right' });

    // Handle dot (ring style matching the visualizer)
    pdf.setFillColor(85, 85, 85);
    pdf.circle(x + w, cursor + ROW_H / 2, HANDLE_R, 'F');
    pdf.setFillColor(255, 255, 255);
    pdf.circle(x + w, cursor + ROW_H / 2, HANDLE_R - 2, 'F');

    cursor += ROW_H;
  });

  // --- Input handle (skip for StartNode) ---
  if (type !== 'StartNode') {
    pdf.setFillColor(85, 85, 85);
    pdf.circle(x, y + 24, HANDLE_R, 'F');
    pdf.setFillColor(255, 255, 255);
    pdf.circle(x, y + 24, HANDLE_R - 2, 'F');
  }
}

// ============================================================
// EDGE DRAWING (Bezier curves with arrowheads)
// ============================================================
function drawEdge(pdf, sx, sy, tx, ty, color) {
  setDraw(pdf, color);
  pdf.setLineWidth(2);

  const isBackward = tx < sx + 50;
  let c1x, c1y, c2x, c2y;

  if (isBackward) {
    const top = Math.min(sy, ty);
    c1x = sx + 80;
    c1y = top - 80;
    c2x = tx - 80;
    c2y = top - 80;
  } else {
    const dist = Math.abs(tx - sx);
    const off = dist * 0.35;
    c1x = sx + off;
    c1y = sy;
    c2x = tx - off;
    c2y = ty;
  }

  // Cubic bezier via jsPDF lines (6-value array = bezier segment, deltas from start)
  pdf.lines(
    [[c1x - sx, c1y - sy, c2x - sx, c2y - sy, tx - sx, ty - sy]],
    sx, sy, [1, 1], 'S'
  );

  // Arrowhead (filled triangle)
  const angle = Math.atan2(ty - c2y, tx - c2x);
  const aLen = 10;
  const aHalf = 5;
  const ax1 = tx - aLen * Math.cos(angle) + aHalf * Math.sin(angle);
  const ay1 = ty - aLen * Math.sin(angle) - aHalf * Math.cos(angle);
  const ax2 = tx - aLen * Math.cos(angle) - aHalf * Math.sin(angle);
  const ay2 = ty - aLen * Math.sin(angle) + aHalf * Math.cos(angle);

  setFill(pdf, color);
  pdf.triangle(tx, ty, ax1, ay1, ax2, ay2, 'F');
}

// ============================================================
// PAGE RENDERER
// ============================================================
function renderPage(pdf, pageData) {
  const { nodes, edges } = pageData;
  if (!nodes || nodes.length === 0) return;

  // 1. Calculate layouts for all nodes
  const nodeMap = {};
  nodes.forEach(n => {
    if (n.isGroupHeader) {
      nodeMap[n.id] = { ...n, totalHeight: 30, handles: {} };
      return;
    }
    const layout = calculateLayout(n.type, n.details);
    nodeMap[n.id] = { ...n, ...layout };
  });

  // 2. Calculate bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  Object.values(nodeMap).forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + NODE_W);
    maxY = Math.max(maxY, n.y + n.totalHeight);
  });

  const margin = 60;
  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const pageW = Math.max(contentW + 2 * margin, 842);
  const pageH = Math.max(contentH + 2 * margin, 595);

  // Offset to center content
  const ox = margin - minX + (pageW - contentW - 2 * margin) / 2;
  const oy = margin - minY + (pageH - contentH - 2 * margin) / 2;

  // Set custom page size
  const currentPage = pdf.internal.getNumberOfPages();
  if (currentPage > 1 || nodes.length > 0) {
    pdf.internal.pageSize.setWidth(pageW);
    pdf.internal.pageSize.setHeight(pageH);
  }

  // 3. Draw edges FIRST (behind nodes)
  (edges || []).forEach(edge => {
    const src = nodeMap[edge.source];
    const tgt = nodeMap[edge.target];
    if (!src || !tgt) return;

    const handleY = src.handles[edge.sourceHandle];
    const sy = (handleY !== undefined) ? src.y + handleY + oy : src.y + HEADER_H / 2 + oy;
    const sx = src.x + NODE_W + ox;

    const tx = tgt.x + ox;
    const ty = tgt.y + 24 + oy;

    drawEdge(pdf, sx, sy, tx, ty, edge.color);
  });

  // 4. Draw nodes ON TOP
  Object.values(nodeMap).forEach(n => {
    const shifted = { ...n, x: n.x + ox, y: n.y + oy };

    if (n.isGroupHeader) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(24);
      pdf.setTextColor(136, 136, 136);
      pdf.text(n.label, shifted.x, shifted.y + 20);
      pdf.setDrawColor(204, 204, 204);
      pdf.setLineWidth(1);
      pdf.line(shifted.x, shifted.y + 26, shifted.x + 400, shifted.y + 26);
      return;
    }

    drawNode(pdf, shifted);
  });
}

// ============================================================
// MESSAGE HANDLER
// ============================================================
self.onmessage = (e) => {
  const { pages } = e.data;

  try {
    // Create first page
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [842, 595],
      compress: true,
    });

    pages.forEach((page, i) => {
      if (i > 0) pdf.addPage([842, 595], 'landscape');
      renderPage(pdf, page);
    });

    const pdfBlob = pdf.output('blob');
    self.postMessage({ type: 'success', blob: pdfBlob });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message || 'Unknown error' });
  }
};
