import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Clock3, Plus, Search, Sparkles, Trash2, Workflow as WorkflowIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WorkflowDto } from '@flownexus/shared';
import { AppHeader } from '../components/AppHeader';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { api, getApiError } from '../lib/api';

function relativeDate(date: string) {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, 'second');
  const minutes = Math.round(seconds / 60); if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
  const hours = Math.round(minutes / 60); if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
  return formatter.format(Math.round(hours / 24), 'day');
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { void (async () => {
    try { const { data } = await api.get<{ workflows: WorkflowDto[] }>('/workflows'); setWorkflows(data.workflows); }
    catch (err) { setError(getApiError(err)); }
    finally { setLoading(false); }
  })(); }, []);

  const visible = useMemo(() => workflows.filter((workflow) => `${workflow.name} ${workflow.description}`.toLowerCase().includes(query.toLowerCase())), [workflows, query]);
  const createWorkflow = async () => {
    setCreating(true); setError('');
    try {
      const { data } = await api.post<{ workflow: WorkflowDto }>('/workflows', { name: 'Untitled workflow', description: '', definition: { nodes: [], edges: [] } });
      navigate(`/workflows/${data.workflow.id}`);
    } catch (err) { setError(getApiError(err)); setCreating(false); }
  };
  const remove = async (event: React.MouseEvent, workflow: WorkflowDto) => {
    event.stopPropagation();
    if (!window.confirm(`Delete “${workflow.name}”? This cannot be undone.`)) return;
    try { await api.delete(`/workflows/${workflow.id}`); setWorkflows((items) => items.filter((item) => item.id !== workflow.id)); }
    catch (err) { setError(getApiError(err)); }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-600"><Sparkles size={15} /> YOUR AUTOMATION SPACE</p><h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Good to see you, {user?.name.split(' ')[0]}.</h1><p className="mt-2 text-gray-500">Build, organize, and keep an eye on your workflows.</p></div>
          <button onClick={createWorkflow} disabled={creating} className="btn-primary self-start px-5 py-3 sm:self-auto">{creating ? <Spinner /> : <Plus size={18} />} New workflow</button>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Total workflows</p><span className="rounded-lg bg-indigo-50 p-2 text-brand-600"><WorkflowIcon size={18} /></span></div><p className="mt-3 font-display text-3xl font-bold">{workflows.length}</p></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Active</p><span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Activity size={18} /></span></div><p className="mt-3 font-display text-3xl font-bold">{workflows.filter((item) => item.status === 'ACTIVE').length}</p></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-500">Recently updated</p><span className="rounded-lg bg-amber-50 p-2 text-amber-600"><Clock3 size={18} /></span></div><p className="mt-3 font-display text-3xl font-bold">{workflows.filter((item) => Date.now() - new Date(item.updatedAt).getTime() < 7 * 86400000).length}</p></div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4"><h2 className="font-display text-xl font-bold">Workflows</h2><label className="relative max-w-xs flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="field pl-10" placeholder="Search workflows" /></label></div>
          {error && <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {loading ? <div className="grid h-52 place-items-center text-gray-400"><Spinner className="h-6 w-6" /></div> : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><WorkflowIcon size={26} /></span><h3 className="mt-5 font-display text-lg font-bold">{query ? 'No matching workflows' : 'Build your first workflow'}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">{query ? 'Try another search term.' : 'Connect a trigger to one or more actions and let FlowNexus handle the repetitive work.'}</p>{!query && <button onClick={createWorkflow} className="btn-primary mt-6"><Plus size={17} /> Create workflow</button>}</div>
          ) : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((workflow) => (
            <article key={workflow.id} role="button" tabIndex={0} onClick={() => navigate(`/workflows/${workflow.id}`)} onKeyDown={(event) => event.key === 'Enter' && navigate(`/workflows/${workflow.id}`)} className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
              <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gray-900 text-white"><WorkflowIcon size={20} /></span><div className="flex items-center gap-1"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${workflow.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : workflow.status === 'PAUSED' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{workflow.status}</span><button onClick={(event) => void remove(event, workflow)} className="rounded-lg p-2 text-gray-300 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100" aria-label={`Delete ${workflow.name}`}><Trash2 size={16} /></button></div></div>
              <h3 className="mt-5 truncate font-display text-lg font-bold">{workflow.name}</h3><p className="mt-1 line-clamp-2 h-10 text-sm leading-5 text-gray-500">{workflow.description || 'No description yet. Open the workflow to add one.'}</p>
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400"><span>{workflow.definition.nodes.length} nodes · Updated {relativeDate(workflow.updatedAt)}</span><ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" /></div>
            </article>
          ))}</div>}
        </section>
      </main>
    </div>
  );
}
