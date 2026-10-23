import { z } from 'zod';

export const workflowStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'PAUSED']);
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;

export const nodeKindSchema = z.enum([
  'webhook',
  'schedule',
  'httpRequest',
  'sendEmail',
  'condition',
  'transform',
]);
export type NodeKind = z.infer<typeof nodeKindSchema>;

export const workflowNodeDataSchema = z.object({
  label: z.string().trim().min(1).max(80),
  kind: nodeKindSchema,
  description: z.string().max(240).optional(),
  config: z.record(z.unknown()).default({}),
});
export type WorkflowNodeData = z.infer<typeof workflowNodeDataSchema>;

export const workflowNodeSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.string().default('workflowNode'),
  position: z.object({ x: z.number().finite(), y: z.number().finite() }),
  data: workflowNodeDataSchema,
});
export type WorkflowNode = z.infer<typeof workflowNodeSchema>;

export const workflowEdgeSchema = z.object({
  id: z.string().min(1).max(120),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  label: z.string().max(80).optional(),
  type: z.string().optional(),
});
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;

export const workflowDefinitionSchema = z.object({
  nodes: z.array(workflowNodeSchema).max(250),
  edges: z.array(workflowEdgeSchema).max(500),
  viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number().min(0.1).max(4) }).optional(),
});
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72).regex(/[a-z]/, 'Password must contain a lowercase letter').regex(/[A-Z]/, 'Password must contain an uppercase letter').regex(/[0-9]/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

export const createWorkflowSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(''),
  status: workflowStatusSchema.default('DRAFT'),
  definition: workflowDefinitionSchema.default({ nodes: [], edges: [] }),
});

export const updateWorkflowSchema = createWorkflowSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;

export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface WorkflowDto {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  definition: WorkflowDefinition;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface ApiError {
  error: { message: string; code: string; details?: unknown };
}
