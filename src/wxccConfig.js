import { NODE_COLORS } from './styles/nodeColors'; 

// Import Graph Components
import MenuNode from './components/nodes/MenuNode';
import LogicNode from './components/nodes/LogicNode';
import ActionNode from './components/nodes/ActionNode';
import TerminatorNode from './components/nodes/TerminatorNode';
import StartNode from './components/nodes/StartNode';

// Import Detail Components
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

export const getNodeConfig = (type) => {
  const t = (type || '').toLowerCase();

  // --- Interaction ---
  if (t.includes('ivr-menu'))      return { ...NODE_COLORS.blue, label: 'Menu', component: MenuNode, detailComponent: MenuDetails };
  if (t.includes('collect'))       return { ...NODE_COLORS.blue, label: 'Collect Digits', component: MenuNode, detailComponent: CollectDigitsDetails };
  if (t.includes('play-message'))  return { ...NODE_COLORS.blue, label: 'Play Message', component: ActionNode, detailComponent: PlayMessageDetails };
  if (t.includes('play-music'))    return { ...NODE_COLORS.blue, label: 'Play Music', component: ActionNode, detailComponent: PlayMusicDetails };
  
  // --- Logic ---
  if (t.includes('case'))          return { ...NODE_COLORS.yellow, label: 'Case', component: LogicNode, detailComponent: ConditionDetails };
  if (t.includes('condition'))     return { ...NODE_COLORS.yellow, label: 'Condition', component: LogicNode, detailComponent: ConditionDetails };
  if (t.includes('business'))      return { ...NODE_COLORS.yellow, label: 'Business Hours', component: LogicNode, detailComponent: BusinessHoursDetails };

  // --- Data ---
  if (t.includes('set'))           return { ...NODE_COLORS.grey, label: 'Set Variable', component: ActionNode, detailComponent: SetVariableDetails };
  if (t.includes('queue-lookup'))  return { ...NODE_COLORS.grey, label: 'Queue Lookup', component: ActionNode, detailComponent: QueueLookupDetails };
  
  // Default Data handlers (HTTP, Parse, BRE, Function)
  if (t.includes('parse') || t.includes('http') || t.includes('bre') || t.includes('fn')) 
                                   return { ...NODE_COLORS.grey, label: 'System Activity', component: ActionNode, detailComponent: DefaultDetails };
  
  // --- Routing ---
  if (t.includes('queue-contact')) return { ...NODE_COLORS.orange, label: 'Queue Contact', component: ActionNode, detailComponent: QueueContactDetails };
  if (t.includes('transfer') || t.includes('hand-off')) return { ...NODE_COLORS.green, label: 'Transfer', component: TerminatorNode, detailComponent: TransferDetails };
  if (t.includes('disconnect'))    return { ...NODE_COLORS.red, label: 'Disconnect', component: TerminatorNode, detailComponent: DefaultDetails };
  
  // --- Other ---
  if (t.includes('subflow'))       return { ...NODE_COLORS.purple, label: 'Subflow', component: ActionNode, detailComponent: SubflowDetails };
  if (t.includes('start') || t.includes('newphone')) return { ...NODE_COLORS.teal, label: 'Start', component: StartNode, detailComponent: StartDetails };

  return { ...NODE_COLORS.grey, label: 'Activity', component: ActionNode, detailComponent: DefaultDetails };
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
