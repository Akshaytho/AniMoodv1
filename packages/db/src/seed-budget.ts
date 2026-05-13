import postgres from 'postgres';

async function main(): Promise<void> {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    console.error('DATABASE_URL is not set. Aborting.');
    process.exit(1);
  }
  const cap = Number(process.env['OPENAI_TOKEN_BUDGET'] ?? 500_000);
  if (!Number.isFinite(cap) || cap <= 0) {
    console.error(`Invalid OPENAI_TOKEN_BUDGET: ${process.env['OPENAI_TOKEN_BUDGET']}`);
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, prepare: false });
  try {
    const [row] = await sql`
      INSERT INTO openai_budget (id, tokens_used, tokens_cap)
      VALUES (1, 0, ${cap})
      ON CONFLICT (id) DO UPDATE
        SET tokens_cap = EXCLUDED.tokens_cap,
            updated_at = NOW()
      RETURNING tokens_used, tokens_cap
    `;
    console.log(`[seed-budget] openai_budget row: ${JSON.stringify(row)}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('[seed-budget] failed:', err);
  process.exit(1);
});
