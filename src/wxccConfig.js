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
import HandoffDetails from './components/details/HandoffDetails';
import SubflowDetails from './components/details/SubflowDetails';
import HTTPRequestDetails from './components/details/HTTPRequestDetails';
import BRERequestDetails from './components/details/BRERequestDetails';
import ParseDetails from './components/details/ParseDetails';
import FunctionDetails from './components/details/FunctionDetails';
import StartDetails from './components/details/StartDetails';
import DefaultDetails from './components/details/DefaultDetails';

export const getNodeConfig = (type) => {
  const t = (type || '').toLowerCase();

  if (t.includes('ivr-menu'))      return { ...NODE_COLORS.blue, label: 'Menu', nodeType: 'MenuNode', component: MenuNode, detailComponent: MenuDetails };
  if (t.includes('collect'))       return { ...NODE_COLORS.blue, label: 'Collect Digits', nodeType: 'CollectDigitsNode', component: CollectDigitsNode, detailComponent: CollectDigitsDetails };
  if (t.includes('play-message'))  return { ...NODE_COLORS.blue, label: 'Play Message', nodeType: 'PlayMessageNode', component: PlayMessageNode, detailComponent: PlayMessageDetails };
  if (t.includes('play-music'))    return { ...NODE_COLORS.blue, label: 'Play Music', nodeType: 'PlayMusicNode', component: PlayMusicNode, detailComponent: PlayMusicDetails };
  
  if (t.includes('case'))          return { ...NODE_COLORS.yellow, label: 'Case', nodeType: 'CaseNode', component: CaseNode, detailComponent: ConditionDetails };
  if (t.includes('condition'))     return { ...NODE_COLORS.yellow, label: 'Condition', nodeType: 'ConditionNode', component: ConditionNode, detailComponent: ConditionDetails };
  if (t.includes('business'))      return { ...NODE_COLORS.yellow, label: 'Business Hours', nodeType: 'BusinessHoursNode', component: BusinessHoursNode, detailComponent: BusinessHoursDetails };

  if (t.includes('set'))           return { ...NODE_COLORS.grey, label: 'Set Variable', nodeType: 'SetVariableNode', component: SetVariableNode, detailComponent: SetVariableDetails };
  if (t.includes('parse'))         return { ...NODE_COLORS.grey, label: 'Parse Data', nodeType: 'ParseNode', component: ParseNode, detailComponent: ParseDetails };
  if (t.includes('http'))          return { ...NODE_COLORS.grey, label: 'HTTP Request', nodeType: 'HTTPRequestNode', component: HTTPRequestNode, detailComponent: HTTPRequestDetails };
  if (t.includes('bre'))           return { ...NODE_COLORS.grey, label: 'BRE Request', nodeType: 'BRERequestNode', component: BRERequestNode, detailComponent: BRERequestDetails };
  if (t.includes('fn'))            return { ...NODE_COLORS.grey, label: 'Custom Function', nodeType: 'FunctionNode', component: FunctionNode, detailComponent: FunctionDetails };
  if (t.includes('lookup'))        return { ...NODE_COLORS.grey, label: 'Queue Lookup', nodeType: 'QueueLookupNode', component: QueueLookupNode, detailComponent: QueueLookupDetails };
  
  if (t.includes('queue-contact')) return { ...NODE_COLORS.orange, label: 'Queue Contact', nodeType: 'QueueContactNode', component: QueueContactNode, detailComponent: QueueContactDetails };
  if (t.includes('transfer'))      return { ...NODE_COLORS.green, label: 'Transfer', nodeType: 'TransferNode', component: TransferNode, detailComponent: TransferDetails };
  if (t.includes('hand-off'))      return { ...NODE_COLORS.green, label: 'GoTo / Handoff', nodeType: 'HandoffNode', component: HandoffNode, detailComponent: HandoffDetails };
  if (t.includes('disconnect'))    return { ...NODE_COLORS.red, label: 'Disconnect', nodeType: 'DisconnectNode', component: DisconnectNode, detailComponent: DefaultDetails };
  
  if (t.includes('subflow'))       return { ...NODE_COLORS.purple, label: 'Subflow', nodeType: 'SubflowNode', component: SubflowNode, detailComponent: SubflowDetails };
  if (t.includes('start') || t.includes('newphone')) return { ...NODE_COLORS.teal, label: 'Start', nodeType: 'StartNode', component: StartNode, detailComponent: StartDetails };

  return { ...NODE_COLORS.grey, label: 'Activity', nodeType: 'DefaultNode', component: DefaultNode, detailComponent: DefaultDetails };
};

export const getValidExits = (type) => {
  const t = (type || '').toLowerCase();
  
  // Specific exclusions based on your feedback
  if (t.includes('parse')) return []; // No error handle
  if (t.includes('fn')) return []; // No error handle for function
  if (t.includes('case')) return []; // Case handles errors internally or via Default
  
  if (t.includes('menu')) return ['timeout', 'invalid', 'error'];
  if (t.includes('collect')) return ['timeout', 'interrupted', 'error'];
  if (t.includes('http') || t.includes('bre')) return ['timeout', 'error'];
  if (t.includes('lookup')) return ['insufficient_data', 'failure', 'error'];
  if (t.includes('queue-contact')) return ['failure', 'error'];
  if (t.includes('transfer') || t.includes('hand-off')) return ['busy', 'no_answer', 'invalid', 'error'];
  if (t.includes('disconnect')) return []; 
  
  return ['error']; // Default for Set Variable, Play, etc.
};
