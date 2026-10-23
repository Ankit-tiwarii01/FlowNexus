import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import { createWorkflowSchema, updateWorkflowSchema } from '@flownexus/shared';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';

export const workflowsRouter = Router();
workflowsRouter.use(requireAuth);

function serializeWorkflow(workflow: { id: string; name: string; description: string; status: 'DRAFT' | 'ACTIVE' | 'PAUSED'; definition: Prisma.JsonValue; createdAt: Date; updatedAt: Date }) {
  return { ...workflow, createdAt: workflow.createdAt.toISOString(), updatedAt: workflow.updatedAt.toISOString() };
}

workflowsRouter.get('/', async (req, res, next) => {
  try {
    const workflows = await prisma.workflow.findMany({ where: { userId: req.userId }, orderBy: { updatedAt: 'desc' } });
    res.json({ workflows: workflows.map(serializeWorkflow) });
  } catch (error) { next(error); }
});

workflowsRouter.post('/', async (req, res, next) => {
  try {
    const input = createWorkflowSchema.parse(req.body);
    const workflow = await prisma.workflow.create({
      data: { ...input, definition: input.definition as Prisma.InputJsonValue, userId: req.userId! },
    });
    res.status(201).json({ workflow: serializeWorkflow(workflow) });
  } catch (error) { next(error); }
});

workflowsRouter.get('/:id', async (req, res, next) => {
  try {
    const workflow = await prisma.workflow.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!workflow) throw new AppError(404, 'Workflow not found', 'WORKFLOW_NOT_FOUND');
    res.json({ workflow: serializeWorkflow(workflow) });
  } catch (error) { next(error); }
});

workflowsRouter.patch('/:id', async (req, res, next) => {
  try {
    const input = updateWorkflowSchema.parse(req.body);
    const existing = await prisma.workflow.findFirst({ where: { id: req.params.id, userId: req.userId }, select: { id: true } });
    if (!existing) throw new AppError(404, 'Workflow not found', 'WORKFLOW_NOT_FOUND');
    const workflow = await prisma.workflow.update({
      where: { id: existing.id },
      data: { ...input, definition: input.definition as Prisma.InputJsonValue | undefined },
    });
    res.json({ workflow: serializeWorkflow(workflow) });
  } catch (error) { next(error); }
});

workflowsRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await prisma.workflow.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    if (!result.count) throw new AppError(404, 'Workflow not found', 'WORKFLOW_NOT_FOUND');
    res.status(204).send();
  } catch (error) { next(error); }
});
