import { useCallback, useEffect, useMemo, useState, type DragEvent } from 'react';
import { addEdge, Background, BackgroundVariant, Controls, MarkerType, MiniMap, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, type Connection } from '@xyflow/react';
import { ArrowLeft, CheckCircle2, ChevronDown, Cloud, CloudOff, Play, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { NodeKind, WorkflowDto, WorkflowStatus } from '@flownexus/shared';
import { Logo } from '../components/Logo';
import { NodeConfigPanel } from '../components/NodeConfigPanel';
import { NodePalette, nodeCatalog } from '../components/NodePalette';
import { Spinner } from '../components/Spinner';
import { ValidationPanel } from '../components/ValidationPanel';
import { WorkflowNode } from '../components/WorkflowNode';
import { api, getApiError } from '../lib/api';
import { validateWorkflow } from '../lib/workflowValidation';
import type { EditorEdge, EditorNode, ValidationIssue } from '../types/editor';

const nodeTypes = { workflowNode: WorkflowNode };
const edgeDefaults = { type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#9ca3af' } };

export function EditorPage() { return <ReactFlowProvider><EditorCanvas /></ReactFlowProvider>; }

function EditorCanvas() {
  const { workflowId } = useParams(); const navigate = useNavigate(); const flow = useReactFlow<EditorNode, EditorEdge>();
  const [nodes, setNodes, onNodesChange] = useNodesState<EditorNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EditorEdge>([]);
  const [workflow, setWorkflow] = useState<WorkflowDto | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [dirty, setDirty] = useState(false);
  const [error, setError] = useState(''); const [issues, setIssues] = useState<ValidationIssue[] | null>(null);
  const selectedNode = nodes.find((node) => node.id === selectedId);

  useEffect(() => { void (async () => {
    try {
      const { data } = await api.get<{ workflow: WorkflowDto }>(`/workflows/${workflowId}`); const item = data.workflow;
      setWorkflow(item); setNodes(item.definition.nodes as EditorNode[]); setEdges(item.definition.edges as EditorEdge[]);
      if (item.definition.viewport) requestAnimationFrame(() => flow.setViewport(item.definition.viewport!));
    } catch (err) { setError(getApiError(err)); }
    finally { setLoading(false); }
  })(); }, [workflowId, setNodes, setEdges, flow]);

  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener('beforeunload', leave); return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);

  const changeNodes = useCallback((changes: Parameters<typeof onNodesChange>[0]) => { onNodesChange(changes); setDirty(true); }, [onNodesChange]);
  const changeEdges = useCallback((changes: Parameters<typeof onEdgesChange>[0]) => { onEdgesChange(changes); setDirty(true); }, [onEdgesChange]);
  const connect = useCallback((connection: Connection) => { setEdges((items) => addEdge({ ...connection, ...edgeDefaults }, items)); setDirty(true); }, [setEdges]);
  const onDrop = useCallback((event: DragEvent) => {
    event.preventDefault(); const kind = event.dataTransfer.getData('application/flownexus') as NodeKind;
    const catalog = nodeCatalog.find((item) => item.kind === kind); if (!catalog) return;
    const id = `${kind}-${crypto.randomUUID()}`;
    setNodes((items) => [...items, { id, type: 'workflowNode', position: flow.screenToFlowPosition({ x: event.clientX, y: event.clientY }), data: { kind, label: catalog.label, description: catalog.description, config: kind === 'schedule' ? { frequency: 'hourly' } : kind === 'httpRequest' ? { method: 'GET' } : {} } }]);
    setSelectedId(id); setDirty(true);
  }, [flow, setNodes]);

  const save = async (status?: WorkflowStatus) => {
    if (!workflow) return false;
    const validation = validateWorkflow(nodes, edges);
    if (status === 'ACTIVE' && validation.some((issue) => issue.type === 'error')) { setIssues(validation); return false; }
    setSaving(true); setError('');
    try {
      const definition = { nodes: nodes.map(({ id, type, position, data }) => ({ id, type: type ?? 'workflowNode', position, data })), edges: edges.map(({ id, source, target, sourceHandle, targetHandle, label, type }) => ({ id, source, target, sourceHandle, targetHandle, label: typeof label === 'string' ? label : undefined, type })), viewport: flow.getViewport() };
      const { data } = await api.patch<{ workflow: WorkflowDto }>(`/workflows/${workflow.id}`, { name: workflow.name, description: workflow.description, status: status ?? workflow.status, definition });
      setWorkflow(data.workflow); setDirty(false); return true;
    } catch (err) { setError(getApiError(err)); return false; }
    finally { setSaving(false); }
  };

  const updateNode = (data: EditorNode['data']) => { setNodes((items) => items.map((node) => node.id === selectedId ? { ...node, data } : node)); setDirty(true); };
  const deleteNode = () => { setNodes((items) => items.filter((node) => node.id !== selectedId)); setEdges((items) => items.filter((edge) => edge.source !== selectedId && edge.target !== selectedId)); setSelectedId(null); setDirty(true); };
  const statusStyle = useMemo(() => workflow?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : workflow?.status === 'PAUSED' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600', [workflow?.status]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-canvas"><Spinner className="h-7 w-7 text-brand-600" /></div>;
  if (!workflow) return <div className="grid min-h-screen place-items-center bg-canvas"><div className="text-center"><CloudOff className="mx-auto text-gray-300" size={40} /><h1 className="mt-4 font-display text-xl font-bold">Workflow unavailable</h1><p className="mt-2 text-sm text-red-600">{error}</p><button onClick={() => navigate('/workflows')} className="btn-secondary mt-5">Back to dashboard</button></div></div>;

  return <div className="flex h-screen flex-col overflow-hidden bg-canvas">
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex min-w-0 items-center gap-3"><Link to="/workflows" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><ArrowLeft size={19} /></Link><div className="hidden border-r border-gray-200 pr-4 sm:block"><Logo compact /></div><div className="min-w-0"><input value={workflow.name} onChange={(event) => { setWorkflow({ ...workflow, name: event.target.value }); setDirty(true); }} className="w-full truncate bg-transparent font-display text-sm font-bold outline-none sm:text-base" aria-label="Workflow name" /><p className="flex items-center gap-1 text-[11px] text-gray-400">{dirty ? <><CloudOff size={11} /> Unsaved changes</> : <><Cloud size={11} /> Saved</>}</p></div></div>
      <div className="flex items-center gap-2"><span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:block ${statusStyle}`}>{workflow.status}</span><button onClick={() => setIssues(validateWorkflow(nodes, edges))} className="btn-secondary hidden px-3 sm:flex"><CheckCircle2 size={16} /> Validate</button><button onClick={() => void save()} disabled={saving || !dirty} className="btn-secondary px-3">{saving ? <Spinner /> : <Save size={16} />}<span className="hidden sm:inline">Save</span></button><button onClick={() => void save(workflow.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')} disabled={saving} className="btn-primary px-3">{workflow.status === 'ACTIVE' ? 'Pause' : <><Play size={15} /> Activate</>}<ChevronDown size={14} className="hidden sm:block" /></button></div>
    </header>
    {error && <div className="absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700 shadow">{error}</div>}
    <div className="flex min-h-0 flex-1"><div className="hidden md:block"><NodePalette /></div><div className="relative min-w-0 flex-1" onDrop={onDrop} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={changeNodes} onEdgesChange={changeEdges} onConnect={connect} onNodeClick={(_event, node) => setSelectedId(node.id)} onPaneClick={() => setSelectedId(null)} nodeTypes={nodeTypes} defaultEdgeOptions={edgeDefaults} deleteKeyCode={['Backspace', 'Delete']} fitView snapToGrid snapGrid={[16,16]} minZoom={0.25} maxZoom={2}><Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#d1d5db" /><Controls position="bottom-left" /><MiniMap position="bottom-right" pannable zoomable nodeColor={(node) => node.data.kind === 'webhook' ? '#8b5cf6' : node.data.kind === 'schedule' ? '#3b82f6' : '#6366f1'} maskColor="rgba(247,248,252,.75)" /></ReactFlow>
      {!nodes.length && <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-8 py-7 text-center backdrop-blur"><p className="font-display font-bold">Start with a trigger</p><p className="mt-1 text-sm text-gray-500">Drag a node from the left onto this canvas.</p></div></div>}
      {issues && <ValidationPanel issues={issues} onClose={() => setIssues(null)} onSelect={(id) => { setSelectedId(id); flow.fitView({ nodes: [{ id }], duration: 300, padding: 1 }); }} />}
    </div>{selectedNode && <NodeConfigPanel node={selectedNode} onChange={updateNode} onDelete={deleteNode} onClose={() => setSelectedId(null)} />}</div>
  </div>;
}
