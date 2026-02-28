# WxCC Flow Visualizer

The **WxCC Flow Visualizer** is a React-based tool that transforms exported Webex Contact Center (WxCC) call flow JSON files into interactive, easy-to-read diagrams. It separates "Happy Paths" from error-handling routines for logical clarity, and supports exporting the complete flow as a vector-based, interactive PDF.

## Live Environment

This project runs entirely on **GitHub**.

* **Hosting**: The live application is hosted at [https://griffindunn.github.io/FlowVisualizer/](https://griffindunn.github.io/FlowVisualizer/).
* **Automated Deployment**: GitHub Actions manage the build and deployment process automatically. Any file updates pushed to the repository trigger an Action that keeps the live webpage up to date.
* **No Manual Build Required**: Because of this automation, standard local commands like `npm run build` or `npm install` are not required for general use or deployment.

## Key Features

* **Intelligent Auto Layout**: Uses a custom Breadth-First Search (BFS) algorithm to build a spanning tree, effectively breaking cycles in call flows while maintaining logical order.
* **Path Prioritization**: The layout engine identifies "Happy Paths" (Success, True, etc.) and prioritizes them to keep the primary business logic straight, while branching error paths (Failure, Timeout, etc.) to the side.
* **Smart Edge Routing**: Implements a `CurvedLoopEdge` component that detects backward loops and arcs them over the graph to prevent line-crossing and visual clutter.
* **Contextual UI Toggles**:
  * **Hide Global Events**: Filters out nodes related to global event handlers to focus on the core IVR flow.
  * **Hide Errors**: Removes red "error" edges to provide a clean view of the successful customer journey.
* **Vector PDF Export**: Generates a fully vector-based PDF with interactive node details, selectable text, and infinite zoom clarity. PDF generation runs in a Web Worker to keep the UI responsive. See [PDF Export](#pdf-export) for details.
* **Node Detail Panel**: Click any node in the visualizer to inspect its full configuration — variables, expressions, prompts, queue settings, and more.
* **Cisco Branding**: Styled using the `CiscoSans` font family and a professional color palette to match official Webex administration interfaces.

## PDF Export

The **Export PDF** button generates a multi-page vector PDF of the entire call flow:

* **Flow Diagram Pages**: The main flow and event flows are each rendered on their own custom-sized page as vector graphics (not screenshots). Nodes, edges, arrowheads, and text are all drawn as PDF primitives, ensuring the output remains crisp at any zoom level with fully selectable/copyable text.
* **Interactive Node Details**: Every node on the flow diagram is clickable. Clicking a node navigates to its dedicated detail section on a US Letter–sized page, displaying the node's full configuration (variables, prompts, queue settings, expressions, etc.) in a structured, readable format.
* **Bidirectional Navigation**: Each detail section includes a "Back to \<Node Name\>" link that returns the viewer to the exact node on the flow diagram, preserving the previous zoom level.
* **Smart Zoom Management**: Detail pages always open at 100% zoom for readability regardless of the flow diagram's zoom level. The PDF opens at a computed zoom level that fits the full flow diagram in the viewer window.
* **Web Worker Processing**: PDF generation runs entirely off the main thread in a Web Worker (`pdfWorker.js`), so the UI remains responsive during export.

### PDF Architecture

The PDF is generated in three phases inside the Web Worker:

1. **Layout Calculation**: Computes node dimensions, bounding boxes, and page sizes for each flow.
2. **Page Planning**: Assigns page numbers to flow diagrams and their detail sections, packing detail nodes sequentially onto US Letter pages.
3. **Rendering**: Creates the jsPDF document, draws all vector content, and adds link annotations for node click navigation.

## Repository File Structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions deployment configuration
├── src/
│   ├── components/
│   │   ├── DownloadButton.jsx         # PDF export button — prepares data and manages the Web Worker
│   │   ├── details/                   # UI components for the node properties panel
│   │   │   ├── BRERequestDetails.jsx
│   │   │   ├── BusinessHoursDetails.jsx
│   │   │   ├── CollectDigitsDetails.jsx
│   │   │   ├── commonStyles.js        # Shared styles for detail components
│   │   │   ├── ConditionDetails.jsx
│   │   │   ├── DefaultDetails.jsx
│   │   │   ├── DetailsPanel.jsx       # Main detail panel dispatcher
│   │   │   ├── FunctionDetails.jsx
│   │   │   ├── HandoffDetails.jsx
│   │   │   ├── HTTPRequestDetails.jsx
│   │   │   ├── MenuDetails.jsx
│   │   │   ├── ParseDetails.jsx
│   │   │   ├── PlayMessageDetails.jsx
│   │   │   ├── PlayMusicDetails.jsx
│   │   │   ├── QueueContactDetails.jsx
│   │   │   ├── QueueLookupDetails.jsx
│   │   │   ├── SetCallerIDDetails.jsx
│   │   │   ├── SetVariableDetails.jsx
│   │   │   ├── StartDetails.jsx
│   │   │   ├── SubflowDetails.jsx
│   │   │   └── TransferDetails.jsx
│   │   ├── edges/
│   │   │   └── CurvedLoopEdge.jsx     # Custom backward-loop edge with arc routing
│   │   ├── icons/
│   │   │   └── NodeIcons.jsx          # SVG icons for WxCC activity types
│   │   └── nodes/                     # Custom React Flow node components
│   │       ├── BaseNodeShell.jsx      # Shared wrapper for all node types
│   │       ├── BRERequestNode.jsx
│   │       ├── BusinessHoursNode.jsx
│   │       ├── CaseNode.jsx
│   │       ├── CollectDigitsNode.jsx
│   │       ├── ConditionNode.jsx
│   │       ├── DefaultNode.jsx
│   │       ├── DisconnectNode.jsx
│   │       ├── FunctionNode.jsx
│   │       ├── HandoffNode.jsx
│   │       ├── HTTPRequestNode.jsx
│   │       ├── LogicNode.jsx
│   │       ├── MenuNode.jsx
│   │       ├── ParseNode.jsx
│   │       ├── PlayMessageNode.jsx
│   │       ├── PlayMusicNode.jsx
│   │       ├── QueueContactNode.jsx
│   │       ├── QueueLookupNode.jsx
│   │       ├── SetCallerIDNode.jsx
│   │       ├── SetVariableNode.jsx
│   │       ├── SimpleActionNode.jsx
│   │       ├── StartNode.jsx
│   │       ├── SubflowNode.jsx
│   │       └── TransferNode.jsx
│   ├── styles/
│   │   └── nodeColors.js             # Color palette mapping for node types
│   ├── utils/
│   │   └── autoLayout.js             # BFS tree layout and subtree measurement algorithm
│   ├── workers/
│   │   └── pdfWorker.js              # Web Worker — vector PDF generation engine
│   ├── index.css                      # Global application styles
│   ├── main.jsx                       # Application entry point and JSON file upload handling
│   ├── MainFlow.jsx                   # Primary React Flow orchestrator and toolbar
│   ├── processWxccJson.js             # Transformer — converts WxCC JSON to React Flow elements
│   └── wxccConfig.js                  # Registry mapping WxCC activities to components and colors
├── index.html                         # Root HTML template
├── package.json                       # Dependencies and scripts
└── vite.config.js                     # Vite build config (base path, Web Worker format)
```

## Technical Architecture

### 1. The Transformation Engine (`src/processWxccJson.js`)

Parses raw WxCC JSON (including the main `process` and nested `eventFlows`) into React Flow nodes and edges:

* **Choice Extraction**: Dynamically creates output handles for `MenuNode` and `CaseNode` by parsing `menuLinks` and `queueLinks` from the JSON properties.
* **Handle Mapping**: Maps raw interaction conditions to specific handle IDs (e.g., mapping "open" to `workingHours`).

### 2. Configuration Registry (`src/wxccConfig.js`)

Centralizes the mapping of WxCC activities to React components and visual styles:

* **Logic (Orange)**: Menus, Conditions, Business Hours, Cases.
* **Action (Purple)**: Set Variables, HTTP Requests, Play Message, Collect Digits.
* **Termination (Pink)**: Blind Transfers, Handoffs, Disconnects.
* **Structure (Blue/Green)**: Subflows, Start Nodes, Queue operations.

### 3. Layout Strategy (`src/utils/autoLayout.js`)

The layout is tree-based rather than force-directed:

* **Root Identification**: Automatically finds the `StartNode` or event headers to begin the tree walk.
* **Measurement Phase**: Recursively calculates the bounding box height for every subtree to ensure sibling nodes do not overlap.

### 4. PDF Export Pipeline (`src/workers/pdfWorker.js` + `src/components/DownloadButton.jsx`)

The export pipeline has two halves:

* **DownloadButton (main thread)**: Splits nodes into main/event flows, strips React-specific data, and posts simplified objects to the Web Worker. On completion, triggers a browser file download.
* **pdfWorker (worker thread)**: Receives serialized node/edge data and generates a vector PDF using jsPDF. Recreates the visual appearance of all 22+ node types as PDF drawing primitives. Adds interactive link annotations for node-to-detail and detail-to-flow navigation. Handles coordinate system differences between jsPDF (top-left origin) and PDF spec (bottom-left origin), including cross-page-size link targeting.

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `reactflow` | Node-based diagram editor |
| `jspdf` | Client-side vector PDF generation |
| `vite` | Build tool with Web Worker bundling support |

## Extending the Visualizer

To add a new WxCC node type:

1. **Component**: Create a new file in `src/components/nodes/` (use `BaseNodeShell` as a wrapper).
2. **Details Panel**: Create a summary component in `src/components/details/` to display relevant properties in the UI.
3. **Config**: Map the new activity name in `src/wxccConfig.js` and define its valid exit handles (e.g., `error`, `timeout`) in the `getValidExits` helper.
4. **PDF Blueprint**: Add a case to `getNodeBlueprint()` in `src/workers/pdfWorker.js` to define the node's body content and exit handles for the PDF.
5. **PDF Details**: Add a case to `getNodeDetailSections()` in `src/workers/pdfWorker.js` to define what configuration data appears on the detail pages.

Once changes are pushed to GitHub, the live site updates automatically via GitHub Actions.
