import { describe, expect, it } from 'vitest';
import { createWorkflowSchema, registerSchema } from '@flownexus/shared';

describe('API input schemas', () => {
  it('normalizes an email during registration', () => {
    const input = registerSchema.parse({ name: 'Ada Lovelace', email: ' ADA@EXAMPLE.COM ', password: 'Secure123' });
    expect(input.email).toBe('ada@example.com');
  });

  it('rejects weak passwords', () => {
    expect(() => registerSchema.parse({ name: 'Ada', email: 'ada@example.com', password: 'password' })).toThrow();
  });

  it('creates a safe empty workflow definition by default', () => {
    const input = createWorkflowSchema.parse({ name: 'First workflow' });
    expect(input.definition).toEqual({ nodes: [], edges: [] });
    expect(input.status).toBe('DRAFT');
  });
});
