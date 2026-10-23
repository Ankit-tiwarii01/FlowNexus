import { Trash2, X } from 'lucide-react';
import type { EditorNode } from '../types/editor';

interface Props {
  node: EditorNode;
  onChange: (data: EditorNode['data']) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onChange, onDelete, onClose }: Props) {
  const setConfig = (key: string, value: string) => onChange({ ...node.data, config: { ...node.data.config, [key]: value } });
  const config = node.data.config as Record<string, string>;
  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-brand-600">Configure node</p><h2 className="mt-1 font-display font-bold">{node.data.label}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={18} /></button></div>
      <div className="space-y-5 p-4">
        <label><span className="label">Display name</span><input className="field" value={node.data.label} onChange={(event) => onChange({ ...node.data, label: event.target.value })} /></label>
        <label><span className="label">Description</span><textarea className="field min-h-20 resize-none" value={node.data.description ?? ''} onChange={(event) => onChange({ ...node.data, description: event.target.value })} placeholder="What does this step do?" /></label>
        {node.data.kind === 'webhook' && <><ReadOnlyField label="Method" value="POST" /><ReadOnlyField label="Endpoint" value="Generated after activation" /></>}
        {node.data.kind === 'schedule' && <><label><span className="label">Frequency</span><select className="field" value={config.frequency ?? 'hourly'} onChange={(event) => setConfig('frequency', event.target.value)}><option value="hourly">Every hour</option><option value="daily">Every day</option><option value="weekly">Every week</option><option value="custom">Custom cron</option></select></label>{config.frequency === 'custom' && <label><span className="label">Cron expression</span><input className="field font-mono" value={config.cron ?? ''} onChange={(event) => setConfig('cron', event.target.value)} placeholder="0 9 * * 1-5" /></label>}</>}
        {node.data.kind === 'httpRequest' && <><label><span className="label">Method</span><select className="field" value={config.method ?? 'GET'} onChange={(event) => setConfig('method', event.target.value)}>{['GET','POST','PUT','PATCH','DELETE'].map((method) => <option key={method}>{method}</option>)}</select></label><label><span className="label">URL</span><input className="field" type="url" value={config.url ?? ''} onChange={(event) => setConfig('url', event.target.value)} placeholder="https://api.example.com/data" /></label></>}
        {node.data.kind === 'sendEmail' && <><label><span className="label">Recipient</span><input className="field" value={config.to ?? ''} onChange={(event) => setConfig('to', event.target.value)} placeholder="team@example.com" /></label><label><span className="label">Subject</span><input className="field" value={config.subject ?? ''} onChange={(event) => setConfig('subject', event.target.value)} placeholder="Workflow notification" /></label></>}
        {node.data.kind === 'condition' && <><label><span className="label">Field</span><input className="field font-mono" value={config.field ?? ''} onChange={(event) => setConfig('field', event.target.value)} placeholder="payload.status" /></label><label><span className="label">Operator</span><select className="field" value={config.operator ?? 'equals'} onChange={(event) => setConfig('operator', event.target.value)}><option value="equals">Equals</option><option value="notEquals">Does not equal</option><option value="contains">Contains</option><option value="exists">Exists</option></select></label><label><span className="label">Value</span><input className="field" value={config.value ?? ''} onChange={(event) => setConfig('value', event.target.value)} /></label></>}
        {node.data.kind === 'transform' && <label><span className="label">Mapping (JSON)</span><textarea className="field min-h-32 resize-y font-mono text-xs" value={config.mapping ?? ''} onChange={(event) => setConfig('mapping', event.target.value)} placeholder={'{\n  "name": "{{payload.name}}"\n}'} /></label>}
      </div>
      <div className="border-t border-gray-100 p-4"><button onClick={onDelete} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={16} /> Delete node</button></div>
    </aside>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <label><span className="label">{label}</span><span className="block rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500">{value}</span></label>;
}
