// src/wxccConfig.js
import { NODE_COLORS } from './styles/nodeColors'; 

// --- Graph Nodes ---
import StartNode from './components/nodes/StartNode';
import MenuNode from './components/nodes/MenuNode';
import CollectDigitsNode from './components/nodes/CollectDigitsNode';
import PlayMessageNode from './components/nodes/PlayMessageNode';
import PlayMusicNode from './components/nodes/PlayMusicNode';
import SetVariableNode from './components/nodes/SetVariableNode';
import ParseNode from './components/nodes/ParseNode';
import HTTPRequestNode from './components/nodes/HTTPRequestNode';
import BRERequestNode from './components/nodes/BRERequestNode';
import FunctionNode from './components/nodes/FunctionNode';
import CaseNode from './components/nodes/CaseNode';
import ConditionNode from './components/nodes/ConditionNode';
import BusinessHoursNode from './components/nodes/BusinessHoursNode';
import QueueContactNode from './components/nodes/QueueContactNode';
import QueueLookupNode from './components/nodes/QueueLookupNode';
import TransferNode from './components/nodes/TransferNode';
import HandoffNode from './components/nodes/HandoffNode';
import SubflowNode from './components/nodes/SubflowNode';
import DisconnectNode from './components/nodes/DisconnectNode';
import DefaultNode from './components/nodes/DefaultNode';

// --- Detail Panels ---
import MenuDetails from './components/details/MenuDetails';
import CollectDigitsDetails from './components/details/CollectDigitsDetails';
import PlayMessageDetails from './components/details/PlayMessageDetails';
import PlayMusicDetails from './components/details/PlayMusicDetails';
import SetVariableDetails from './components/details/SetVariableDetails';
import ConditionDetails from './components/details/ConditionDetails';
import BusinessHoursDetails from './components/details/BusinessHoursDetails';
import QueueContactDetails from './components/details/QueueContactDetails';
import QueueLookupDetails from './components/details/QueueLookupDetails';
import TransferDetails from './components/details/TransferDetails';
import HandoffDetails from './components/details/HandoffDetails'; // New
import SubflowDetails from './components/details/SubflowDetails';
import HTTPRequestDetails from './components/details/HTTPRequestDetails'; // New
import BRERequestDetails from './components/details/BRERequestDetails'; // New
import ParseDetails from './components/details/ParseDetails'; // New
import FunctionDetails from './components/details/FunctionDetails'; // New
import StartDetails from './components/details/StartDetails';
import DefaultDetails from './components/details/DefaultDetails';

export const getNodeConfig = (type) => {
  const t = (type || '').toLowerCase();

  // Interaction
  if (t.includes('ivr-menu'))      return { ...NODE_COLORS.blue, label: 'Menu', component: MenuNode, detailComponent: MenuDetails };
  if (t.includes('collect'))       return { ...NODE_COLORS.blue, label: 'Collect Digits', component: CollectDigitsNode, detailComponent: CollectDigitsDetails };
  if (t.includes('play-message'))  return { ...NODE_COLORS.blue, label: 'Play Message', component: PlayMessageNode, detailComponent: PlayMessageDetails };
  if (t.includes('play-music'))    return { ...NODE_COLORS.blue, label: 'Play Music', component: PlayMusicNode, detailComponent: PlayMusicDetails };
  
  // Logic
  if (t.includes('case'))          return { ...NODE_COLORS.yellow, label: 'Case', component: CaseNode, detailComponent: ConditionDetails };
  if (t.includes('condition'))     return { ...NODE_COLORS.yellow, label: 'Condition', component: ConditionNode, detailComponent: ConditionDetails };
  if (t.includes('business'))      return { ...NODE_COLORS.yellow, label: 'Business Hours', component: BusinessHoursNode, detailComponent: BusinessHoursDetails };

  // Data / System
  if (t.includes('set'))           return { ...NODE_COLORS.grey, label: 'Set Variable', component: SetVariableNode, detailComponent: SetVariableDetails };
  if (t.includes('parse'))         return { ...NODE_COLORS.grey, label: 'Parse Data', component: ParseNode, detailComponent: ParseDetails };
  if (t.includes('http'))          return { ...NODE_COLORS.grey, label: 'HTTP Request', component: HTTPRequestNode, detailComponent: HTTPRequestDetails };
  if (t.includes('bre'))           return { ...NODE_COLORS.grey, label: 'BRE Request', component: BRERequestNode, detailComponent: BRERequestDetails };
  if (t.includes('fn'))            return { ...NODE_COLORS.grey, label: 'Custom Function', component: FunctionNode, detailComponent: FunctionDetails };
  if (t.includes('lookup'))        return { ...NODE_COLORS.grey, label: 'Queue Lookup', component: QueueLookupNode, detailComponent: QueueLookupDetails };
  
  // Routing
  if (t.includes('queue-contact')) return { ...NODE_COLORS.orange, label: 'Queue Contact', component: QueueContactNode, detailComponent: QueueContactDetails };
  if (t.includes('transfer'))      return { ...NODE_COLORS.green, label: 'Transfer', component: TransferNode, detailComponent: TransferDetails };
  if (t.includes('hand-off'))      return { ...NODE_COLORS.green, label: 'GoTo / Handoff', component: HandoffNode, detailComponent: HandoffDetails };
  if (t.includes('disconnect'))    return { ...NODE_COLORS.red, label: 'Disconnect', component: DisconnectNode, detailComponent: DefaultDetails };
  
  // Advanced
  if (t.includes('subflow'))       return { ...NODE_COLORS.purple, label: 'Subflow', component: SubflowNode, detailComponent: SubflowDetails };
  if (t.includes('start') || t.includes('newphone')) return { ...NODE_COLORS.teal, label: 'Start', component: StartNode, detailComponent: StartDetails };

  return { ...NODE_COLORS.grey, label: 'Activity', component: DefaultNode, detailComponent: DefaultDetails };
};

export const getValidExits = (type) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('menu')) return ['timeout', 'invalid', 'error'];
  if (t.includes('collect')) return ['timeout', 'interrupted', 'error'];
  if (t.includes('http') || t.includes('bre')) return ['timeout', 'error'];
  if (t.includes('lookup')) return ['insufficient_data', 'failure', 'error'];
  if (t.includes('queue-contact')) return ['failure', 'error'];
  if (t.includes('transfer') || t.includes('hand-off')) return ['busy', 'no_answer', 'invalid', 'error'];
  if (t.includes('disconnect')) return []; 
  
  return ['error']; 
};
