import postgres from 'postgres';
import { createOpenAIClient } from './client';
import { createBudget } from './budget';
import { paraphraseSignal } from './paraphrase';

async function main(): Promise<void> {
  const url = process.env['DATABASE_URL'];
  if (!url) {
    console.error('DATABASE_URL is not set. Aborting.');
    process.exit(1);
  }
  if (!process.env['OPENAI_API_KEY']) {
    console.error('OPENAI_API_KEY is not set. Aborting.');
    process.exit(1);
  }
  if (!process.env['OPENAI_MODEL_CHEAP']) {
    console.error('OPENAI_MODEL_CHEAP is not set. Aborting.');
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, prepare: false });
  const budget = createBudget(sql);
  const openai = createOpenAIClient();

  const before = await budget.status();
  console.log(`[smoke] budget before: ${before.used}/${before.cap}`);

  try {
    const out = await paraphraseSignal(
      { openai, budget },
      {
        titleName: 'Vinland Saga',
        sourceType: 'reddit',
        sourceUrl: 'https://www.reddit.com/r/animesuggest/comments/example/',
        sourceText:
          'Vinland Saga absolutely wrecked me. Watching Thorfinn realize that revenge had hollowed him out and then start over as a farmer felt like watching someone rebuild a self after burning theirs down. The slave arc especially - I have never felt so seen by an anime.',
      },
    );
    console.log(`[smoke] tokens used: ${out.tokensUsed}`);
    console.log(`[smoke] parsed result: ${JSON.stringify(out.result, null, 2)}`);
  } finally {
    const after = await budget.status();
    console.log(`[smoke] budget after:  ${after.used}/${after.cap}`);
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('[smoke] failed:', err);
  process.exit(1);
});
