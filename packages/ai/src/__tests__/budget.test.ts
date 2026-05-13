import { describe, it, expect, beforeEach } from 'vitest';
import { createBudget, BudgetExceededError } from '../budget';

/**
 * In-memory mock of postgres-js's `sql` tagged template.
 * We only need to support the three queries `budget.ts` issues.
 */
type Row = { tokens_used: number; tokens_cap: number };

function mockSql(initial: Row) {
  let state: Row = { ...initial };

  function fn(strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown[]> {
    const sql = strings.join('?').toUpperCase();
    if (sql.startsWith('\n        UPDATE OPENAI_BUDGET\n           SET TOKENS_USED = TOKENS_USED + ?'.toUpperCase().slice(0, 50))) {
      // Could be the conditional reserve UPDATE or the unconditional reconcile UPDATE.
      const delta = Number(values[0]);
      const isConditional = sql.includes('WHERE ID = 1 AND TOKENS_USED + ?');
      if (isConditional) {
        const wouldBe = state.tokens_used + delta;
        if (wouldBe > state.tokens_cap) return Promise.resolve([]);
        state.tokens_used = wouldBe;
        return Promise.resolve([{ tokens_used: state.tokens_used, tokens_cap: state.tokens_cap }]);
      }
      // reconcile: GREATEST
      state.tokens_used = Math.max(state.tokens_used + delta, 0);
      return Promise.resolve([{ tokens_used: state.tokens_used }]);
    }
    if (sql.includes('SELECT TOKENS_USED, TOKENS_CAP FROM OPENAI_BUDGET')) {
      return Promise.resolve([{ tokens_used: state.tokens_used, tokens_cap: state.tokens_cap }]);
    }
    if (sql.includes('SELECT TOKENS_USED FROM OPENAI_BUDGET')) {
      return Promise.resolve([{ tokens_used: state.tokens_used }]);
    }
    throw new Error(`Unexpected SQL in test: ${strings.join('?')}`);
  }

  return {
    sql: fn as unknown as Parameters<typeof createBudget>[0],
    snapshot: () => ({ ...state }),
  };
}

describe('budget.reserve', () => {
  let m: ReturnType<typeof mockSql>;
  beforeEach(() => {
    m = mockSql({ tokens_used: 0, tokens_cap: 1000 });
  });

  it('debits when under cap', async () => {
    const b = createBudget(m.sql);
    const used = await b.reserve(400);
    expect(used).toBe(400);
    expect(m.snapshot().tokens_used).toBe(400);
  });

  it('throws BudgetExceededError when over cap', async () => {
    const b = createBudget(m.sql);
    await b.reserve(900);
    await expect(b.reserve(200)).rejects.toBeInstanceOf(BudgetExceededError);
    expect(m.snapshot().tokens_used).toBe(900); // unchanged
  });

  it('refuses request equal to remaining + 1', async () => {
    const b = createBudget(m.sql);
    await b.reserve(999);
    await expect(b.reserve(2)).rejects.toBeInstanceOf(BudgetExceededError);
  });

  it('allows request that exactly fills the cap', async () => {
    const b = createBudget(m.sql);
    await b.reserve(1000);
    expect(m.snapshot().tokens_used).toBe(1000);
  });
});

describe('budget.reconcile', () => {
  it('refunds when actual < estimate', async () => {
    const m = mockSql({ tokens_used: 0, tokens_cap: 1000 });
    const b = createBudget(m.sql);
    await b.reserve(500);
    const used = await b.reconcile(500, 300);
    expect(used).toBe(300);
  });

  it('debits when actual > estimate', async () => {
    const m = mockSql({ tokens_used: 0, tokens_cap: 1000 });
    const b = createBudget(m.sql);
    await b.reserve(200);
    const used = await b.reconcile(200, 350);
    expect(used).toBe(350);
  });

  it('clamps at zero', async () => {
    const m = mockSql({ tokens_used: 100, tokens_cap: 1000 });
    const b = createBudget(m.sql);
    const used = await b.reconcile(50, -500);
    expect(used).toBe(0);
  });
});

describe('budget.status', () => {
  it('reports used/cap/remaining', async () => {
    const m = mockSql({ tokens_used: 250, tokens_cap: 1000 });
    const b = createBudget(m.sql);
    expect(await b.status()).toEqual({ used: 250, cap: 1000, remaining: 750 });
  });
});
