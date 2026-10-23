import { Braces, CalendarClock, GitBranch, Globe2, Mail, Webhook, type LucideIcon } from 'lucide-react';
import type { NodeKind } from '@flownexus/shared';

export const nodeCatalog: { kind: NodeKind; label: string; description: string; icon: LucideIcon; color: string }[] = [
  { kind: 'webhook', label: 'Webhook', description: 'Receive an HTTP request', icon: Webhook, color: 'bg-violet-500' },
  { kind: 'schedule', label: 'Schedule', description: 'Run at a set interval', icon: CalendarClock, color: 'bg-blue-500' },
  { kind: 'httpRequest', label: 'HTTP request', description: 'Call an external API', icon: Globe2, color: 'bg-cyan-500' },
  { kind: 'sendEmail', label: 'Send email', description: 'Deliver an SMTP email', icon: Mail, color: 'bg-rose-500' },
  { kind: 'condition', label: 'Condition', description: 'Branch on a value', icon: GitBranch, color: 'bg-amber-500' },
  { kind: 'transform', label: 'Transform', description: 'Map and reshape data', icon: Braces, color: 'bg-emerald-500' },
];

export function NodePalette() {
  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nodes</p><p className="mt-1 text-sm text-gray-500">Drag a node onto the canvas.</p>
      <div className="mt-5 space-y-2">{nodeCatalog.map(({ kind, label, description, icon: Icon, color }) => <div key={kind} draggable onDragStart={(event) => { event.dataTransfer.setData('application/flownexus', kind); event.dataTransfer.effectAllowed = 'move'; }} className="flex cursor-grab items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-brand-200 hover:bg-brand-50/40 active:cursor-grabbing"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white ${color}`}><Icon size={17} /></span><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-gray-400">{description}</p></div></div>)}</div>
      <div className="mt-6 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500"><strong className="text-gray-700">Tip:</strong> Start with one trigger, add actions, then drag between handles to connect them.</div>
    </aside>
  );
}
