import type { EditorEdge, EditorNode, ValidationIssue } from '../types/editor';

const triggerKinds = new Set(['webhook', 'schedule']);

export function validateWorkflow(nodes: EditorNode[], edges: EditorEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!nodes.length) return [{ type: 'error', message: 'Add at least one trigger and one action.' }];

  const triggers = nodes.filter((node) => triggerKinds.has(node.data.kind));
  if (!triggers.length) issues.push({ type: 'error', message: 'Every workflow needs a trigger.' });
  if (triggers.length > 1) issues.push({ type: 'error', message: 'Use exactly one trigger per workflow.' });
  if (nodes.length === 1) issues.push({ type: 'error', message: 'Connect at least one action to your trigger.' });

  const connected = new Set(edges.flatMap((edge) => [edge.source, edge.target]));
  nodes.filter((node) => !connected.has(node.id)).forEach((node) => issues.push({ type: 'error', message: `“${node.data.label}” is not connected.`, nodeId: node.id }));

  edges.forEach((edge) => {
    if (!nodes.some((node) => node.id === edge.source) || !nodes.some((node) => node.id === edge.target)) {
      issues.push({ type: 'error', message: 'A connection points to a missing node.' });
    }
  });

  const adjacency = new Map<string, string[]>();
  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach((edge) => adjacency.get(edge.source)?.push(edge.target));
  const visiting = new Set<string>(); const visited = new Set<string>();
  const hasCycle = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if (adjacency.get(id)?.some(hasCycle)) return true;
    visiting.delete(id); visited.add(id); return false;
  };
  if (nodes.some((node) => hasCycle(node.id))) issues.push({ type: 'error', message: 'Workflow connections cannot contain a cycle.' });

  nodes.forEach((node) => {
    if (node.data.kind === 'httpRequest' && !node.data.config.url) issues.push({ type: 'warning', message: `Add a URL to “${node.data.label}”.`, nodeId: node.id });
    if (node.data.kind === 'sendEmail' && !node.data.config.to) issues.push({ type: 'warning', message: `Add a recipient to “${node.data.label}”.`, nodeId: node.id });
  });
  return issues;
}
