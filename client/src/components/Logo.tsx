import { Workflow } from 'lucide-react';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white shadow-sm"><Workflow size={19} strokeWidth={2.3} /></span>
      {!compact && <span className="font-display text-xl font-extrabold tracking-tight text-ink">Flow<span className="text-brand-600">Nexus</span></span>}
    </div>
  );
}
