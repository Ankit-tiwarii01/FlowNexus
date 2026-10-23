import type { Edge, Node } from '@xyflow/react';
import type { WorkflowNodeData } from '@flownexus/shared';

export type EditorNode = Node<WorkflowNodeData, 'workflowNode'>;
export type EditorEdge = Edge;

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
}
