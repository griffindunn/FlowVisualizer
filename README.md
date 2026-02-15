This version of the `README.md` includes the live environment details and a comprehensive breakdown of the repository's file structure.

---

# WxCC Flow Visualizer

The **WxCC Flow Visualizer** is a specialized React-based tool designed to transform exported Webex Contact Center (WxCC) call flow JSON files into interactive, easy-to-read diagrams. It focuses on logical clarity by separating "Happy Paths" from error-handling routines.

## 🌐 Live Environment

This project runs entirely on **GitHub**.

* **Hosting**: The live application is hosted at [https://griffindunn.github.io/FlowVisualizer/](https://griffindunn.github.io/FlowVisualizer/).
* **Automated Deployment**: GitHub Actions manage the build and deployment process automatically. Any file updates pushed to the repository trigger an Action that keeps the live webpage up to date.
* **No Manual Build Required**: Because of this automation, standard local commands like `npm run build` or `npm install` are not required for general use or deployment.

## 🚀 Key Features

* **Intelligent Auto Layout**: Uses a custom Breadth-First Search (BFS) algorithm to build a spanning tree, effectively breaking cycles in call flows while maintaining logical order.
* **Path Prioritization**: The layout engine identifies "Happy Paths" (Success, True, etc.) and prioritizes them to keep the primary business logic straight, while branching error paths (Failure, Timeout, etc.) to the side.
* **Smart Edge Routing**: Implements a `CurvedLoopEdge` component that detects backward loops and arcs them high over the graph to prevent line-crossing and visual clutter.
* **Contextual UI Toggles**:
* **Hide Global Events**: Filters out nodes related to global event handlers (e.g., global error catches) to focus on the core IVR flow.
* **Hide Errors**: Removes red "error" edges to provide a clean view of the successful customer journey.


* **Cisco Branding**: Styled using the `CiscoSans` font family and a professional color palette to match official Webex administration interfaces.

## 📂 Repository File Structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated deployment configuration
├── src/
│   ├── components/
│   │   ├── details/            # UI components for the node properties panel
│   │   │   ├── BRERequestDetails.jsx
│   │   │   ├── BusinessHoursDetails.jsx
│   │   │   ├── CollectDigitsDetails.jsx
│   │   │   ├── commonStyles.js
│   │   │   ├── ConditionDetails.jsx
│   │   │   ├── DefaultDetails.jsx
│   │   │   ├── DetailsPanel.jsx
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
│   │   │   └── CurvedLoopEdge.jsx  # Custom logic for backward looping edges
│   │   ├── icons/
│   │   │   └── NodeIcons.jsx       # SVG icons for various WxCC activities
│   │   └── nodes/              # Custom React Flow node components
│   │       ├── BaseNodeShell.jsx
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
│   │   └── nodeColors.js       # Color palette mapping for node types
│   ├── utils/
│   │   └── autoLayout.js       # Core layout and tree-generation algorithm
│   ├── index.css               # Global application styles
│   ├── main.jsx                # Application entry and file upload handling
│   ├── MainFlow.jsx            # Primary React Flow orchestrator
│   ├── processWxccJson.js      # Transformer for converting JSON to flow elements
│   └── wxccConfig.js           # Registry for node components and valid exits
├── index.html                  # Root HTML template
├── package.json                # Dependencies and scripts
└── vite.config.js              # Build and deployment configuration

```

## 📂 Technical Architecture

### 1. The Transformation Engine (`src/processWxccJson.js`)

This script parses the raw WxCC JSON (including the main `process` and nested `eventFlows`) into React Flow nodes and edges. It performs:

* **Choice Extraction**: Dynamically creates output handles for `MenuNode` and `CaseNode` by parsing `menuLinks` and `queueLinks` from the JSON properties.
* **Handle Mapping**: Maps raw interaction conditions to specific handle IDs (e.g., mapping "open" to `workingHours`).

### 2. Configuration Registry (`src/wxccConfig.js`)

Centralizes the mapping of WxCC activities to React components and styles:

* **Logic (Orange)**: Menus, Conditions, Business Hours.
* **Action (Purple)**: Set Variables, HTTP Requests, Play Message, Collect Digits.
* **Termination (Pink)**: Blind Transfers, Handoffs, Disconnects.
* **Structure (Blue/Green)**: Subflows and Start Nodes.

### 3. Layout Strategy (`src/utils/autoLayout.js`)

The layout is tree-based rather than force-directed:

* **Root Identification**: Automatically finds the `StartNode` or event headers to begin the tree walk.
* **Measurement Phase**: Recursively calculates the bounding box height for every subtree to ensure sibling nodes do not overlap.

## 🎨 Extending the Visualizer

To add a new WxCC node type:

1. **Component**: Create a new file in `src/components/nodes/` (use `BaseNodeShell` as a wrapper).
2. **Details**: Create a summary component in `src/components/details/` to display relevant properties.
3. **Config**: Map the new activity name in `src/wxccConfig.js` and define its valid exit handles (e.g., `error`, `timeout`) in the `getValidExits` helper.

Once these changes are pushed to GitHub, the live site will update automatically.
