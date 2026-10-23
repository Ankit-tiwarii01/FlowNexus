import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Braces, CalendarClock, GitBranch, Globe2, Mail, Webhook } from 'lucide-react';
import type { EditorNode } from '../types/editor';

const appearances = {
  webhook: { icon: Webhook, color: 'bg-violet-500', category: 'Trigger' },
  schedule: { icon: CalendarClock, color: 'bg-blue-500', category: 'Trigger' },
  httpRequest: { icon: Globe2, color: 'bg-cyan-500', category: 'Action' },
  sendEmail: { icon: Mail, color: 'bg-rose-500', category: 'Action' },
  condition: { icon: GitBranch, color: 'bg-amber-500', category: 'Logic' },
  transform: { icon: Braces, color: 'bg-emerald-500', category: 'Data' },
};

export function WorkflowNode({ data, selected }: NodeProps<EditorNode>) {
  const appearance = appearances[data.kind]; const Icon = appearance.icon;
  return (
    <div className={`min-w-56 rounded-2xl border bg-white p-3.5 shadow-md transition ${selected ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-gray-200'}`}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-gray-400" />
      <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl text-white ${appearance.color}`}><Icon size={19} /></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{appearance.category}</p><p className="truncate text-sm font-bold text-gray-800">{data.label}</p></div></div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-brand-500" />
    </div>
  );
}
