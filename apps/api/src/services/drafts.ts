import { and, desc, eq } from 'drizzle-orm';
import type { DbClient } from '@animood/db';
import { pageDrafts, pages } from '@animood/db';

export interface ListDraftsFilter {
  status?: 'pending_review' | 'review_passed' | 'review_flagged' | 'approved' | 'rejected' | undefined;
  limit: number;
  offset: number;
}

export async function listDrafts(db: DbClient, filter: ListDraftsFilter) {
  const where = filter.status ? eq(pageDrafts.status, filter.status) : undefined;
  return db
    .select({
      id: pageDrafts.id,
      pageType: pageDrafts.pageType,
      entitySlug: pageDrafts.entitySlug,
      title: pageDrafts.title,
      status: pageDrafts.status,
      wordCount: pageDrafts.wordCount,
      reviewFlags: pageDrafts.reviewFlags,
      createdAt: pageDrafts.createdAt,
    })
    .from(pageDrafts)
    .where(where)
    .orderBy(desc(pageDrafts.createdAt))
    .limit(filter.limit)
    .offset(filter.offset);
}

export async function getDraft(db: DbClient, id: number) {
  const [row] = await db.select().from(pageDrafts).where(eq(pageDrafts.id, id)).limit(1);
  return row ?? null;
}

export async function approveDraft(db: DbClient, id: number): Promise<{ published: boolean; slug?: string }> {
  return db.transaction(async (tx) => {
    const [draft] = await tx.select().from(pageDrafts).where(eq(pageDrafts.id, id)).limit(1);
    if (!draft) return { published: false };

    // Upsert into pages by (pageType, entitySlug)
    const slug = `${draft.pageType}/${draft.entitySlug}`;
    await tx
      .insert(pages)
      .values({
        slug,
        pageType: draft.pageType,
        title: draft.title,
        markdown: draft.markdown,
        schemaJsonld: draft.schemaJsonld,
      })
      .onConflictDoUpdate({
        target: pages.slug,
        set: {
          markdown: draft.markdown,
          schemaJsonld: draft.schemaJsonld,
          title: draft.title,
          updatedAt: new Date(),
        },
      });

    await tx
      .update(pageDrafts)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(pageDrafts.id, id));

    return { published: true, slug };
  });
}

export async function rejectDraft(db: DbClient, id: number): Promise<{ updated: boolean }> {
  const result = await db
    .update(pageDrafts)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(and(eq(pageDrafts.id, id)))
    .returning({ id: pageDrafts.id });
  return { updated: result.length > 0 };
}
