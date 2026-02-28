import { jsPDF } from 'jspdf';

// ============================================================
// CONSTANTS — Flow Diagram
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
// CONSTANTS — Detail Pages
// ============================================================
const DET_PAGE_W = 612;
const DET_PAGE_H = 792;
const DET_MARGIN = 50;
const DET_W = DET_PAGE_W - 2 * DET_MARGIN;

const DET_HDR_H = 40;
const DET_SEC_H = 22;
const DET_ROW_H = 32;
const DET_CODE_PAD = 16;
const DET_CODE_LINE = 13;
const DET_MAP_H = 20;
const DET_BACK_H = 24;
const DET_GAP = 28;

// ============================================================
// COLOR HELPERS
// ============================================================
function parseColor(color) {
  if (!color) return [0, 0, 0];
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) return [parseInt(hex[0]+hex[0],16), parseInt(hex[1]+hex[1],16), parseInt(hex[2]+hex[2],16)];
    return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
  }
  const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  return [0, 0, 0];
}

function setFill(pdf, c) { const rgb = parseColor(c); pdf.setFillColor(rgb[0], rgb[1], rgb[2]); }
function setDraw(pdf, c) { const rgb = parseColor(c); pdf.setDrawColor(rgb[0], rgb[1], rgb[2]); }
function setText(pdf, c) { const rgb = parseColor(c); pdf.setTextColor(rgb[0], rgb[1], rgb[2]); }

// ============================================================
// NODE BLUEPRINT (body content + exit handles for the diagram)
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
      (details.choices || []).forEach(c => exits.push({ id: c.id, label: c.label, color: '#444', badge: String(c.id) }));
      exits.push({ id: 'timeout', label: 'No-Input Timeout', color: '#999', sep: true });
      exits.push({ id: 'invalid', label: 'Unmatched Entry', color: '#999' });
      exits.push({ id: 'error', label: 'Undefined Error', color: '#999' });
      break;
    }
    case 'CaseNode': {
      body.push({ type: 'sectionLabel', text: 'Cases' });
      (details.cases || []).forEach(c => exits.push({ id: c.id, label: c.label, color: '#444' }));
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
      exits.push({ id: 'invalid', label: 'Unmatched Entry', color: '#999' });
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
      if (assigns.length > 0) assigns.forEach(a => body.push({ type: 'assign', variable: a.srcVariable || '?', value: String(a.expr || a.literal || a.tgtVariable || 'null').substring(0, 30) }));
      else body.push({ type: 'text', text: 'No variables set', color: '#bbb', italic: true });
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
// DIAGRAM LAYOUT CALCULATOR
// ============================================================
function calculateLayout(type, details) {
  const { body, exits } = getNodeBlueprint(type, details);
  let cursor = HEADER_H;
  const handles = {};
  body.forEach(item => { cursor += ({ sectionLabel: SECTION_LABEL_H, text: TEXT_LINE_H, bold: TEXT_LINE_H, labelVal: TEXT_LINE_H, assign: ASSIGNMENT_H, exprBox: EXPR_BOX_H, msgBox: MSG_BOX_H, badge: BADGE_H })[item.type] || TEXT_LINE_H; });
  exits.forEach(exit => { if (exit.sep) cursor += SEP_H; handles[exit.id] = cursor + ROW_H / 2; cursor += ROW_H; });
  if (cursor - HEADER_H < MIN_BODY_H) { const diff = MIN_BODY_H - (cursor - HEADER_H); Object.keys(handles).forEach(k => { handles[k] += diff; }); cursor += diff; }
  return { totalHeight: cursor, handles, body, exits };
}

// ============================================================
// DIAGRAM NODE DRAWING
// ============================================================
function drawNode(pdf, n) {
  const { x, y, totalHeight: h, headerColor, borderColor, fontColor, label, subtitle, body, exits, type } = n;
  const w = NODE_W, r = CORNER_R;

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, r, r, 'F');

  setFill(pdf, headerColor);
  pdf.roundedRect(x, y, w, HEADER_H + r, r, r, 'F');
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y + HEADER_H, w, r, 'F');

  setDraw(pdf, borderColor);
  pdf.setLineWidth(0.5);
  pdf.line(x, y + HEADER_H, x + w, y + HEADER_H);

  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);
  pdf.roundedRect(x, y, w, h, r, r, 'S');

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14); setText(pdf, fontColor);
  pdf.text(String(label || '').substring(0, 32), x + 12, y + 22);
  pdf.setFont('helvetica', 'italic'); pdf.setFontSize(11); pdf.setTextColor(85, 85, 85);
  pdf.text(subtitle || '', x + 12, y + 38);

  let cursor = y + HEADER_H;
  body.forEach(item => {
    switch (item.type) {
      case 'sectionLabel':
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(170, 170, 170);
        pdf.text(item.text.toUpperCase(), x + 12, cursor + 14); cursor += SECTION_LABEL_H; break;
      case 'text':
        pdf.setFont('helvetica', item.italic ? 'italic' : 'normal'); pdf.setFontSize(11); setText(pdf, item.color || '#555');
        pdf.text(String(item.text).substring(0, 42), x + 12, cursor + 14); cursor += TEXT_LINE_H; break;
      case 'bold':
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); setText(pdf, item.color || '#292929');
        pdf.text(String(item.text).substring(0, 38), x + 12, cursor + 14); cursor += TEXT_LINE_H; break;
      case 'labelVal': {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(170, 170, 170);
        const lbl = item.label + ':'; pdf.text(lbl, x + 12, cursor + 14);
        const lw = pdf.getTextWidth(lbl) + 4;
        pdf.setFont('helvetica', 'bold'); setText(pdf, item.valColor || '#005073');
        pdf.text(String(item.value).substring(0, 30), x + 12 + lw, cursor + 14); cursor += TEXT_LINE_H; break;
      }
      case 'assign': {
        pdf.setFont('courier', 'bold'); pdf.setFontSize(10); pdf.setTextColor(0, 80, 115);
        const vt = String(item.variable).substring(0, 18); pdf.text(vt, x + 12, cursor + 10);
        const vw = pdf.getTextWidth(vt);
        pdf.setFont('courier', 'normal'); pdf.setTextColor(153, 153, 153); pdf.text(' = ', x + 12 + vw, cursor + 10);
        const ew = pdf.getTextWidth(' = '); pdf.setTextColor(230, 81, 0);
        pdf.text(String(item.value), x + 12 + vw + ew, cursor + 10); cursor += ASSIGNMENT_H; break;
      }
      case 'exprBox':
        pdf.setFillColor(249, 249, 249); pdf.setDrawColor(238, 238, 238); pdf.setLineWidth(0.5);
        pdf.roundedRect(x + 12, cursor + 4, w - 24, EXPR_BOX_H - 8, 4, 4, 'FD');
        pdf.setFont('helvetica', 'italic'); pdf.setFontSize(10); pdf.setTextColor(133, 133, 133);
        pdf.text(String(item.text).substring(0, 42), x + 16, cursor + 18); cursor += EXPR_BOX_H; break;
      case 'msgBox':
        pdf.setFillColor(225, 245, 254); pdf.setDrawColor(179, 229, 252); pdf.setLineWidth(0.5);
        pdf.roundedRect(x + 12, cursor + 4, w - 24, MSG_BOX_H - 8, 4, 4, 'FD');
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(2, 119, 189);
        pdf.text(String(item.text).substring(0, 45), x + 16, cursor + 18); cursor += MSG_BOX_H; break;
      case 'badge': {
        setFill(pdf, item.bg); pdf.roundedRect(x + 40, cursor + 4, w - 80, BADGE_H - 8, 10, 10, 'F');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); setText(pdf, item.fg);
        const bw = pdf.getTextWidth(item.text); pdf.text(item.text, x + w / 2 - bw / 2, cursor + 18); cursor += BADGE_H; break;
      }
    }
  });

  exits.forEach(exit => {
    if (exit.sep) { pdf.setDrawColor(238, 238, 238); pdf.setLineWidth(0.5); pdf.line(x, cursor + SEP_H / 2, x + w, cursor + SEP_H / 2); cursor += SEP_H; }
    if (exit.badge) {
      pdf.setDrawColor(204, 204, 204); pdf.setFillColor(255, 255, 255); pdf.setLineWidth(0.5);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9);
      const btw = pdf.getTextWidth(exit.badge); const bw = Math.max(18, btw + 8);
      pdf.roundedRect(x + 12, cursor + 3, bw, 18, 9, 9, 'FD');
      pdf.setTextColor(85, 85, 85); pdf.text(exit.badge, x + 12 + bw / 2, cursor + 15, { align: 'center' });
    }
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); setText(pdf, exit.color);
    pdf.text(exit.label, x + w - 20, cursor + 16, { align: 'right' });
    pdf.setFillColor(85, 85, 85); pdf.circle(x + w, cursor + ROW_H / 2, HANDLE_R, 'F');
    pdf.setFillColor(255, 255, 255); pdf.circle(x + w, cursor + ROW_H / 2, HANDLE_R - 2, 'F');
    cursor += ROW_H;
  });

  if (type !== 'StartNode') {
    pdf.setFillColor(85, 85, 85); pdf.circle(x, y + 24, HANDLE_R, 'F');
    pdf.setFillColor(255, 255, 255); pdf.circle(x, y + 24, HANDLE_R - 2, 'F');
  }
}

// ============================================================
// EDGE DRAWING
// ============================================================
function drawEdge(pdf, sx, sy, tx, ty, color) {
  setDraw(pdf, color); pdf.setLineWidth(2);
  const isBackward = tx < sx + 50;
  let c1x, c1y, c2x, c2y;
  if (isBackward) { const top = Math.min(sy, ty); c1x = sx + 80; c1y = top - 80; c2x = tx - 80; c2y = top - 80; }
  else { const d = Math.abs(tx - sx) * 0.35; c1x = sx + d; c1y = sy; c2x = tx - d; c2y = ty; }
  pdf.lines([[c1x - sx, c1y - sy, c2x - sx, c2y - sy, tx - sx, ty - sy]], sx, sy, [1, 1], 'S');
  const a = Math.atan2(ty - c2y, tx - c2x), L = 10, W = 5;
  setFill(pdf, color);
  pdf.triangle(tx, ty, tx - L*Math.cos(a) + W*Math.sin(a), ty - L*Math.sin(a) - W*Math.cos(a), tx - L*Math.cos(a) - W*Math.sin(a), ty - L*Math.sin(a) + W*Math.cos(a), 'F');
}

// ============================================================
// FLOW PAGE LAYOUT
// ============================================================
function calculatePageLayout(pageData) {
  const { nodes, edges } = pageData;
  if (!nodes || nodes.length === 0) return null;
  const nodeMap = {};
  nodes.forEach(n => {
    if (n.isGroupHeader) { nodeMap[n.id] = { ...n, totalHeight: 30, handles: {} }; return; }
    nodeMap[n.id] = { ...n, ...calculateLayout(n.type, n.details) };
  });
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  Object.values(nodeMap).forEach(n => { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x + NODE_W + HANDLE_R); maxY = Math.max(maxY, n.y + n.totalHeight); });
  (edges || []).forEach(edge => {
    const src = nodeMap[edge.source], tgt = nodeMap[edge.target];
    if (!src || !tgt) return;
    if (tgt.x < src.x + NODE_W + 50) { minY = Math.min(minY, Math.min(src.y + (src.handles[edge.sourceHandle] || HEADER_H / 2), tgt.y + 24) - 80); }
  });
  const margin = 80, cW = maxX - minX, cH = maxY - minY;
  const pageW = Math.max(cW + 2 * margin, 842), pageH = Math.max(cH + 2 * margin, 595);
  return { nodeMap, edges, pageW, pageH, ox: margin - minX + (pageW - cW - 2 * margin) / 2, oy: margin - minY + (pageH - cH - 2 * margin) / 2 };
}

// ============================================================
// FLOW PAGE RENDERER (with clickable links to detail pages)
// ============================================================
function renderFlowPage(pdf, layout, detailPlan) {
  const { nodeMap, edges, ox, oy, pageH } = layout;
  const { nodeToPage, nodeToDetailY } = detailPlan;
  (edges || []).forEach(edge => {
    const src = nodeMap[edge.source], tgt = nodeMap[edge.target];
    if (!src || !tgt) return;
    const hY = src.handles[edge.sourceHandle];
    drawEdge(pdf, src.x + NODE_W + ox, (hY !== undefined ? src.y + hY : src.y + HEADER_H / 2) + oy, tgt.x + ox, tgt.y + 24 + oy, edge.color);
  });
  Object.values(nodeMap).forEach(n => {
    const s = { ...n, x: n.x + ox, y: n.y + oy };
    if (n.isGroupHeader) {
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(24); pdf.setTextColor(136, 136, 136);
      pdf.text(n.label, s.x, s.y + 20);
      pdf.setDrawColor(204, 204, 204); pdf.setLineWidth(1); pdf.line(s.x, s.y + 26, s.x + 400, s.y + 26);
      return;
    }
    drawNode(pdf, s);
    if (nodeToPage && nodeToPage[n.id]) {
      const detY = (nodeToDetailY && nodeToDetailY[n.id]) || 0;
      // XYZ converts top via (currentPageH - top); annotation is on flow page
      // so pre-adjust: flowPageH - value = DET_PAGE_H - detY → value = flowPageH - DET_PAGE_H + detY
      const adjTop = pageH - DET_PAGE_H + detY;
      pdf.link(s.x, s.y, NODE_W, s.totalHeight, { pageNumber: nodeToPage[n.id], magFactor: 'XYZ', left: 0, top: adjTop, zoom: 1 });
    }
  });
}

// ============================================================
// NODE DETAIL SECTIONS (mirrors the React detail components)
// ============================================================
function getNodeDetailSections(type, details) {
  const d = details || {};
  const secs = [];

  switch (type) {
    case 'StartNode':
      secs.push({ title: 'Trigger', items: [
        { type: 'kv', k: 'Event', v: d.event || 'NewPhoneContact' },
        { type: 'kv', k: 'Channel', v: d.channel || 'Telephony' },
      ] }); break;

    case 'MenuNode': {
      const prompts = d.promptsTts || [];
      if (prompts.length > 0) secs.push({ title: 'Prompt', items: prompts.map(p => ({ type: 'code', badge: p.type === 'tts' ? 'TTS' : 'Audio', text: p.value || p.name || '' })) });
      secs.push({ title: 'Settings', items: [
        { type: 'kv', k: 'Entry Timeout', v: (d.entryTimeout || '10') + 's' },
        { type: 'kv', k: 'Interruptible', v: d.interruptible ? 'Yes' : 'No' },
      ] }); break;
    }

    case 'CollectDigitsNode':
      secs.push({ title: 'Input Configuration', items: [
        { type: 'kv', k: 'Variable', v: d.variable || 'Digits' },
        { type: 'kv', k: 'Max Digits', v: String(d.maxDigits || 'N/A') },
        { type: 'kv', k: 'Min Digits', v: String(d.minDigits || '1') },
        { type: 'kv', k: 'Terminator', v: d.terminatorSymbol || 'None' },
      ] });
      secs.push({ title: 'Timers', items: [
        { type: 'kv', k: 'Entry Timeout', v: (d.entryTimeout || 'N/A') + 's' },
        { type: 'kv', k: 'Inter-digit Timeout', v: (d.interDigitTimeout || 'N/A') + 's' },
      ] }); break;

    case 'PlayMessageNode': {
      const prompts = d.promptsTts || d.prompts || [];
      secs.push({ title: 'Settings', items: [{ type: 'kv', k: 'Interruptible', v: d.interruptible ? 'Yes' : 'No' }] });
      if (prompts.length > 0) secs.push({ title: 'Audio Source', items: prompts.map(p => ({ type: 'code', badge: (p.type === 'tts' ? 'TTS' : 'Audio'), text: p.value || p.name || '' })) });
      break;
    }

    case 'PlayMusicNode':
      secs.push({ title: 'Music Settings', items: [
        { type: 'kv', k: 'Duration', v: d.duration ? d.duration + 's' : 'Continuous' },
        { type: 'kv', k: 'Source', v: d.audioRadioGroup || 'Static Audio' },
      ] });
      secs.push({ title: 'Audio File', items: [{ type: 'code', text: d.prompt || d['prompt:name'] || d.musicFile || 'Default' }] });
      break;

    case 'SetVariableNode': {
      let vars = [];
      if (Array.isArray(d.setVariablesArray) && d.setVariablesArray.length > 0) vars = d.setVariablesArray;
      else if (d.srcVariable) vars = [d];
      secs.push({ title: 'Variables (' + vars.length + ')', items: vars.length > 0
        ? vars.map(v => ({ type: 'kv', k: v.srcVariable || v.name || '?', v: String(v.literal || v.value || v.expr || v.tgtVariable || 'null') }))
        : [{ type: 'kv', k: 'Status', v: 'No variables set' }]
      }); break;
    }

    case 'ConditionNode':
      secs.push({ title: 'Configuration', items: [{ type: 'kv', k: 'Description', v: d.description || 'N/A' }] });
      if (d.expression) secs.push({ title: 'Expression', items: [{ type: 'code', text: d.expression }] });
      break;

    case 'BusinessHoursNode':
      secs.push({ title: 'Schedule', items: [
        { type: 'kv', k: 'Schedule', v: d['businessHoursId:name'] || d.businessHoursId || 'N/A' },
        { type: 'kv', k: 'Mode', v: d.businessHoursRadioGroup || 'N/A' },
      ] }); break;

    case 'QueueContactNode': {
      const isSB = d['destination:type'] === 'SKILLS_BASED';
      secs.push({ title: 'Queue Selection', items: [
        { type: 'kv', k: 'Mode', v: d.queueRadioGroup || 'Static' },
        { type: 'kv', k: 'Destination', v: d['destination:name'] || d.destination || d.destinationVariable || 'N/A' },
        { type: 'kv', k: 'Type', v: isSB ? 'Skill-Based' : 'Queue-Based' },
      ] });
      if (isSB && d.skills) secs.push({ title: 'Skill Requirements', items: [{ type: 'code', text: JSON.stringify(d.skills, null, 2) }] });
      break;
    }

    case 'QueueLookupNode':
      secs.push({ title: 'Lookup Settings', items: [
        { type: 'kv', k: 'Lookback', v: (d.ewtLookbackMinutes || 'N/A') + ' min' },
        { type: 'kv', k: 'Queue', v: d['destination:name'] || d.destination || 'N/A' },
      ] }); break;

    case 'TransferNode':
      if (d.handOffFlow) secs.push({ title: 'Flow Handoff', items: [
        { type: 'kv', k: 'Flow Name', v: d.handOffFlow.handOffToName || 'N/A' },
        { type: 'kv', k: 'Flow ID', v: d.handOffFlow.handOffTo || 'N/A' },
      ] });
      else secs.push({ title: 'Blind Transfer', items: [{ type: 'kv', k: 'Destination', v: d['transfertodn:name'] || d.transfertodn || 'N/A' }] });
      break;

    case 'HandoffNode':
      if (d.handOffFlow) {
        secs.push({ title: 'Flow Handoff', items: [
          { type: 'kv', k: 'Flow Name', v: d.handOffFlow.handOffToName || 'N/A' },
          { type: 'kv', k: 'Flow ID', v: d.handOffFlow.handOffTo || 'N/A' },
          { type: 'kv', k: 'Version', v: d.handOffFlow.flowTagName || 'Latest' },
        ] });
        if (d.handOffFlow.mappedVariableArray) secs.push({ title: 'Variable Mapping', items: [{ type: 'code', text: JSON.stringify(d.handOffFlow.mappedVariableArray, null, 2) }] });
      } break;

    case 'SubflowNode': {
      secs.push({ title: 'Flow Info', items: [{ type: 'kv', k: 'Subflow', v: d.subflowName || 'N/A' }] });
      const si = d.subflowInputVariables || [];
      if (si.length > 0) secs.push({ title: 'Inputs', items: si.map(v => ({ type: 'map', tgt: v.target || '?', src: v.src || '?', arrow: '←' })) });
      const so = d.subflowOutputVariables || [];
      if (so.length > 0) secs.push({ title: 'Outputs', items: so.map(v => ({ type: 'map', tgt: v.target || '?', src: v.src || '?', arrow: '←' })) });
      break;
    }

    case 'HTTPRequestNode':
      secs.push({ title: 'Request Config', items: [
        { type: 'kv', k: 'Method', v: d.httpRequestMethod || 'GET' },
        { type: 'kv', k: 'URL', v: d.httpRequestUrl || 'N/A' },
        { type: 'kv', k: 'Content Type', v: d.httpContentType || 'N/A' },
        { type: 'kv', k: 'Timeout', v: (d.httpResponseTimeout || 'N/A') + 'ms' },
      ] });
      if (d.httpQueryParameters && typeof d.httpQueryParameters === 'object') { const p = Object.entries(d.httpQueryParameters); if (p.length > 0) secs.push({ title: 'Query Parameters', items: p.map(([k, v]) => ({ type: 'kv', k, v: String(v) })) }); }
      if (d.httpRequestHeaders && typeof d.httpRequestHeaders === 'object') { const h = Object.entries(d.httpRequestHeaders); if (h.length > 0) secs.push({ title: 'Headers', items: h.map(([k, v]) => ({ type: 'kv', k, v: String(v) })) }); }
      if (Array.isArray(d.outputVariableArray) && d.outputVariableArray.length > 0) secs.push({ title: 'Output Parsing', items: d.outputVariableArray.map(v => ({ type: 'map', tgt: v.outputVariable || '?', src: v.jsonPathExp || '?', arrow: '←' })) });
      break;

    case 'BRERequestNode':
      secs.push({ title: 'Business Rules Engine', items: [
        { type: 'kv', k: 'URL', v: d.httpRequestUrl || 'System Default' },
        { type: 'kv', k: 'Timeout', v: (d.httpResponseTimeout || 'N/A') + 'ms' },
      ] });
      if (d.httpQueryParameters && typeof d.httpQueryParameters === 'object') { const p = Object.entries(d.httpQueryParameters); if (p.length > 0) secs.push({ title: 'Input Parameters', items: p.map(([k, v]) => ({ type: 'kv', k, v: String(v) })) }); }
      if (Array.isArray(d.outputVariableArray) && d.outputVariableArray.length > 0) secs.push({ title: 'Output Parsing', items: d.outputVariableArray.map(v => ({ type: 'map', tgt: v.outputVariable || '?', src: v.jsonPathExp || '?', arrow: '←' })) });
      break;

    case 'ParseNode':
      secs.push({ title: 'Parse Configuration', items: [
        { type: 'kv', k: 'Input', v: d.inputVariable || 'N/A' },
        { type: 'kv', k: 'Format', v: d.contentType || 'N/A' },
      ] });
      if (Array.isArray(d.outputVariableArray) && d.outputVariableArray.length > 0) secs.push({ title: 'Output Mapping', items: d.outputVariableArray.map(v => ({ type: 'map', tgt: v.outputVariable || '?', src: v.jsonPathExp || '?', arrow: '←' })) });
      break;

    case 'FunctionNode': {
      secs.push({ title: 'Custom Function', items: [
        { type: 'kv', k: 'Name', v: d.fnName || d.functionName || 'N/A' },
        { type: 'kv', k: 'Version', v: (d.fnVersionConfig && d.fnVersionConfig.version) || 'Latest' },
      ] });
      const fi = d.fnInputVariables || [];
      if (fi.length > 0) secs.push({ title: 'Inputs', items: fi.map(v => ({ type: 'map', tgt: v.target || v.outputVariable || '?', src: v.src || v.jsonPathExp || '?', arrow: '←' })) });
      const fo = d.fnOutputVariables || [];
      if (fo.length > 0) secs.push({ title: 'Outputs', items: fo.map(v => ({ type: 'map', tgt: v.target || v.outputVariable || '?', src: v.src || v.jsonPathExp || '?', arrow: '→' })) });
      break;
    }

    case 'DisconnectNode':
      secs.push({ title: 'Action', items: [{ type: 'kv', k: 'Behavior', v: 'Disconnect Contact' }] }); break;

    default: {
      const items = [];
      Object.entries(d).forEach(([key, val]) => { if (!key.startsWith('_') && key !== 'activityId' && typeof val !== 'object') items.push({ type: 'kv', k: key, v: String(val) }); });
      if (items.length > 0) secs.push({ title: 'Properties', items });
      break;
    }
  }
  return secs;
}

// ============================================================
// DETAIL HEIGHT ESTIMATION (for page planning)
// ============================================================
function estimateCodeLines(text) {
  const lines = String(text || '').split('\n');
  let total = 0;
  lines.forEach(l => { total += Math.max(1, Math.ceil(l.length / 75)); });
  return total;
}

function estimateDetailHeight(sections) {
  let h = DET_HDR_H;
  sections.forEach(sec => {
    h += DET_SEC_H;
    sec.items.forEach(item => {
      if (item.type === 'kv') {
        const valLen = String(item.v || '').length;
        const estLines = Math.max(1, Math.ceil(valLen / 72));
        h += 30 + estLines * 14;
      }
      else if (item.type === 'code') {
        const lines = estimateCodeLines(item.text);
        h += (item.badge ? 18 : 4) + 10 + lines * DET_CODE_LINE + 8 + 4;
      }
      else if (item.type === 'map') h += DET_MAP_H;
    });
  });
  h += DET_BACK_H + DET_GAP;
  return h;
}

// ============================================================
// DETAIL PAGE PLANNER (assigns each node to a page number)
// ============================================================
function planDetailPages(detailNodes, startPage) {
  const nodeToPage = {};
  const nodeToDetailY = {};
  let page = startPage;
  let used = 0;
  const cap = DET_PAGE_H - 2 * DET_MARGIN;

  detailNodes.forEach(n => {
    const h = estimateDetailHeight(n.sections);
    if (used > 0 && used + h > cap) { page++; used = 0; }
    nodeToPage[n.id] = page;
    nodeToDetailY[n.id] = DET_MARGIN + used;
    used += h;
  });

  return { nodeToPage, nodeToDetailY, totalPages: detailNodes.length > 0 ? page - startPage + 1 : 0 };
}

// ============================================================
// DETAIL PAGE RENDERING
// ============================================================
function renderDetailPages(pdf, detailNodes, plan, flowPageNum, flowPageH) {
  if (detailNodes.length === 0) return;

  let currentPage = -1;
  let cy = 0;
  const mx = DET_MARGIN;
  const w = DET_W;

  detailNodes.forEach(n => {
    const targetPage = plan.nodeToPage[n.id];

    if (targetPage !== currentPage) {
      pdf.addPage();
      pdf.internal.pageSize.setWidth(DET_PAGE_W);
      pdf.internal.pageSize.setHeight(DET_PAGE_H);
      currentPage = targetPage;
      cy = DET_MARGIN;
    }

    // --- Node detail header bar ---
    setFill(pdf, n.headerColor);
    pdf.roundedRect(mx, cy, w, DET_HDR_H - 4, 6, 6, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    setText(pdf, n.fontColor || '#292929');
    pdf.text(String(n.label || '').substring(0, 60), mx + 12, cy + 17);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text(n.subtitle || '', mx + 12, cy + 30);
    cy += DET_HDR_H;

    // --- Sections ---
    n.sections.forEach(sec => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(153, 153, 153);
      pdf.text(sec.title.toUpperCase(), mx + 4, cy + 15);
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.5);
      pdf.line(mx + 4, cy + 18, mx + w - 4, cy + 18);
      cy += DET_SEC_H;

      sec.items.forEach(item => {
        switch (item.type) {
          case 'kv': {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(120, 120, 120);
            pdf.text(item.k, mx + 8, cy + 12);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.setTextColor(34, 34, 34);
            const valLines = pdf.splitTextToSize(String(item.v), w - 16);
            valLines.forEach((line, li) => {
              pdf.text(line, mx + 8, cy + 26 + li * 14);
            });
            cy += 30 + valLines.length * 14;
            break;
          }

          case 'code': {
            let codeTop = cy + 4;

            if (item.badge) {
              pdf.setFillColor(2, 119, 189);
              pdf.roundedRect(mx + 8, cy + 2, 32, 13, 3, 3, 'F');
              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(7);
              pdf.setTextColor(255, 255, 255);
              pdf.text(item.badge, mx + 24, cy + 11, { align: 'center' });
              codeTop = cy + 18;
            }

            pdf.setFont('courier', 'normal');
            pdf.setFontSize(9);
            const codeLines = pdf.splitTextToSize(String(item.text || ''), w - 40);
            const boxH = 10 + codeLines.length * DET_CODE_LINE + 8;

            pdf.setFillColor(245, 245, 245);
            pdf.setDrawColor(230, 230, 230);
            pdf.setLineWidth(0.5);
            pdf.roundedRect(mx + 8, codeTop, w - 16, boxH, 4, 4, 'FD');

            pdf.setTextColor(60, 60, 60);
            codeLines.forEach((line, li) => {
              pdf.text(line, mx + 16, codeTop + 10 + (li + 0.7) * DET_CODE_LINE);
            });

            cy = codeTop + boxH + 4;
            break;
          }

          case 'map':
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(120, 120, 120);
            pdf.text(item.tgt, mx + 8, cy + 14);
            {
              const tw = pdf.getTextWidth(item.tgt);
              pdf.setTextColor(180, 180, 180);
              pdf.text(' ' + item.arrow + ' ', mx + 8 + tw, cy + 14);
              const aw = pdf.getTextWidth(' ' + item.arrow + ' ');
              pdf.setFont('courier', 'normal');
              pdf.setFontSize(9);
              pdf.setTextColor(34, 34, 34);
              pdf.text(String(item.src).substring(0, 60), mx + 8 + tw + aw, cy + 14);
            }
            cy += DET_MAP_H;
            break;
        }
      });
    });

    // --- Separator ---
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(mx, cy + 4, mx + w, cy + 4);
    cy += 12;

    // --- Back to Flow link (one per node, targets the node's position) ---
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(2, 119, 189);
    pdf.text('\u2190 Back to ' + String(n.label || 'Flow Diagram').substring(0, 40), mx + 4, cy + 14);
    // XYZ handler converts top via (currentPageH - top), but we're on a detail page
    // targeting the flow page, so pre-adjust: pass (DET_PAGE_H - flowPageH + flowAbsY)
    // so the conversion yields (flowPageH - flowAbsY) = correct PDF coordinate.
    // Subtract 30pt to add breathing room above the node in the viewport.
    const adjTop = DET_PAGE_H - flowPageH + (n.flowAbsY || 0) - 30;
    pdf.link(mx, cy, w, 18, { pageNumber: flowPageNum, magFactor: 'XYZ', left: Math.max(0, (n.flowAbsX || 0) - 50), top: adjTop, zoom: 0 });
    cy += DET_BACK_H + DET_GAP;
  });
}

// ============================================================
// MESSAGE HANDLER
// ============================================================
self.onmessage = (e) => {
  const { pages } = e.data;

  try {
    // --- Phase 1: pre-calculate all layouts ---
    const flowDataSets = [];
    pages.forEach(pageData => {
      const layout = calculatePageLayout(pageData);
      if (!layout) return;

      const detailNodes = Object.values(layout.nodeMap)
        .filter(n => !n.isGroupHeader)
        .sort((a, b) => a.y - b.y || a.x - b.x)
        .map(n => ({ ...n, sections: getNodeDetailSections(n.type, n.details), flowAbsX: n.x + layout.ox, flowAbsY: n.y + layout.oy }));

      flowDataSets.push({ layout, detailNodes });
    });

    if (flowDataSets.length === 0) {
      self.postMessage({ type: 'error', error: 'No content to export' });
      return;
    }

    // --- Phase 2: assign page numbers ---
    let pageNum = 1;
    const renderQueue = [];

    flowDataSets.forEach(ds => {
      const flowPageNum = pageNum;
      pageNum++;

      const detailPlan = planDetailPages(ds.detailNodes, pageNum);
      pageNum += detailPlan.totalPages;

      renderQueue.push({ layout: ds.layout, detailNodes: ds.detailNodes, detailPlan, flowPageNum });
    });

    // --- Phase 3: create PDF and render ---
    const pdf = new jsPDF({ unit: 'pt', compress: true });
    pdf.setDisplayMode('fullpage');

    renderQueue.forEach((item, idx) => {
      if (idx > 0) pdf.addPage();
      pdf.internal.pageSize.setWidth(item.layout.pageW);
      pdf.internal.pageSize.setHeight(item.layout.pageH);

      renderFlowPage(pdf, item.layout, item.detailPlan);
      renderDetailPages(pdf, item.detailNodes, item.detailPlan, item.flowPageNum, item.layout.pageH);
    });

    self.postMessage({ type: 'success', blob: pdf.output('blob') });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message || 'Unknown error' });
  }
};
