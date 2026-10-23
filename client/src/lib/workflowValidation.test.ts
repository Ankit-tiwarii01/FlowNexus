import { describe, expect, it } from 'vitest';
import { validateWorkflow } from './workflowValidation';
import type { EditorNode } from '../types/editor';

const node = (id: string, kind: EditorNode['data']['kind']): EditorNode => ({ id, type: 'workflowNode', position: { x: 0, y: 0 }, data: { label: id, kind, config: {} } });

describe('workflow validation', () => {
  it('accepts a connected trigger and action', () => {
    expect(validateWorkflow([node('trigger', 'webhook'), node('action', 'transform')], [{ id: 'e1', source: 'trigger', target: 'action' }])).toEqual([]);
  });

  it('detects a cycle', () => {
    const issues = validateWorkflow([node('trigger', 'schedule'), node('action', 'transform')], [{ id: 'e1', source: 'trigger', target: 'action' }, { id: 'e2', source: 'action', target: 'trigger' }]);
    expect(issues.some((issue) => issue.message.includes('cycle'))).toBe(true);
  });
});
