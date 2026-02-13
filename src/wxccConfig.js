// src/wxccConfig.js

// Import Graph Nodes
import MenuNode from './components/nodes/MenuNode';
import LogicNode from './components/nodes/LogicNode';
import ActionNode from './components/nodes/ActionNode'; // Generic Linear
import TerminatorNode from './components/nodes/TerminatorNode'; // Ends of flow
import StartNode from './components/nodes/StartNode';

// Import Detail Panels
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
import SubflowDetails from './components/details/SubflowDetails';
import StartDetails from './components/details/StartDetails';
import DefaultDetails from './components/details/DefaultDetails';

export const NODE_COLORS = {
  blue:   { bg: '#E1F5FE', border: '#0277BD', header: '#0277BD', label: 'Interaction' },
  yellow: { bg: '#FFF8E1', border: '#FF8F00', header: '#FFB300', label: 'Logic' },
  grey:   { bg: '#F5F5F5', border: '#757575', header: '#757575', label: 'Data' },
  orange: { bg: '#FFF3E0', border: '#EF6C00', header: '#EF6C00', label: 'Queue' },
  green:  { bg: '#E8F5E9', border: '#2E7D32', header: '#43A047', label: 'Transfer' },
  red:    { bg: '#FFEBEE', border: '#C62828', header: '#D32F2F', label: 'Disconnect' },
  purple: { bg: '#F3E5F5', border: '#7B1FA2', header: '#8E24AA', label: 'Subflow' },
  teal:   { bg: '#E0F2F1', border: '#00695C', header: '#00897B', label: 'Start' }
};

export const getNodeConfig = (type) => {
  const t = (type || '').toLowerCase();

  // --- Interaction ---
  if (t.includes('ivr-menu'))      return { ...NODE_COLORS.blue, label: 'Menu', component: MenuNode, detailComponent: MenuDetails };
  if (t.includes('collect'))       return { ...NODE_COLORS.blue, label: 'Collect Digits', component: ActionNode, detailComponent: CollectDigitsDetails };
  if (t.includes('play-message'))  return { ...NODE_COLORS.blue, label: 'Play Message', component: ActionNode, detailComponent: PlayMessageDetails };
  if (t.includes('play-music'))    return { ...NODE_COLORS.blue, label: 'Play Music', component: ActionNode, detailComponent: PlayMusicDetails };
  
  // --- Logic ---
  if (t.includes('case'))          return { ...NODE_COLORS.yellow, label: 'Case', component: LogicNode, detailComponent: ConditionDetails };
  if (t.includes('condition'))     return { ...NODE_COLORS.yellow, label: 'Condition', component: LogicNode, detailComponent: ConditionDetails };
  if (t.includes('business'))      return { ...NODE_COLORS.yellow, label: 'Business Hours', component: LogicNode, detailComponent: BusinessHoursDetails };

  // --- Data ---
  if (t.includes('set'))           return { ...NODE_COLORS.grey, label: 'Set Variable', component: ActionNode, detailComponent: SetVariableDetails };
  if (t.includes('queue-lookup'))  return { ...NODE_COLORS.grey, label: 'Queue Lookup', component: ActionNode, detailComponent: QueueLookupDetails };
  // Default Data handlers
  if (t.includes('parse') || t.includes('http') || t.includes('bre') || t.includes('fn')) 
                                   return { ...NODE_COLORS.grey, label: 'System Activity', component: ActionNode, detailComponent: DefaultDetails };
  
  // --- Routing ---
  if (t.includes('queue-contact')) return { ...NODE_COLORS.orange, label: 'Queue Contact', component: ActionNode, detailComponent: QueueContactDetails };
  if (t.includes('transfer') || t.includes('hand-off')) return { ...NODE_COLORS.green, label: 'Transfer', component: TerminatorNode, detailComponent: TransferDetails };
  if (t.includes('disconnect'))    return { ...NODE_COLORS.red, label: 'Disconnect', component: TerminatorNode, detailComponent: DefaultDetails };
  
  // --- Other ---
  if (t.includes('subflow'))       return { ...NODE_COLORS.purple, label: 'Subflow', component: ActionNode, detailComponent: SubflowDetails };
  if (t.includes('start') || t.includes('newphone')) return { ...NODE_COLORS.teal, label: 'Start', component: StartNode, detailComponent: StartDetails };

  return { ...NODE_COLORS.grey, label: 'Unknown', component: ActionNode, detailComponent: DefaultDetails };
};

export const getValidExits = (type) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('menu')) return ['timeout', 'invalid', 'error'];
  if (t.includes('collect')) return ['timeout', 'interrupted', 'error'];
  if (t.includes('http') || t.includes('bre')) return ['timeout', 'error'];
  if (t.includes('queue-lookup')) return ['insufficient_data', 'failure', 'error'];
  if (t.includes('queue-contact')) return ['failure', 'error'];
  if (t.includes('transfer') || t.includes('hand-off')) return ['busy', 'no_answer', 'invalid', 'error'];
  if (t.includes('disconnect')) return []; 
  
  return ['error']; 
};
