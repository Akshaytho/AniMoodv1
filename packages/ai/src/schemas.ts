import { z } from 'zod';

export const paraphraseSignalSchema = z.object({
  pattern: z.string().min(1).max(500),
  emotion_signals: z.array(z.string().min(1).max(60)).max(8),
  intensity_hint: z.number().int().min(1).max(5).nullable(),
  confidence_in_signal: z.number().int().min(0).max(100),
});
export type ParaphraseSignalResult = z.infer<typeof paraphraseSignalSchema>;

export const extractedMappingSchema = z.object({
  emotion: z.string().min(1).max(60),
  intensity: z.number().int().min(1).max(5),
  evidence_notes: z.string().min(1).max(800),
  supporting_signal_count: z.number().int().min(0),
  confidence: z.enum(['low', 'medium', 'high']),
});
export type ExtractedMapping = z.infer<typeof extractedMappingSchema>;

export const extractMappingsSchema = z.object({
  title_slug: z.string().min(1).max(120),
  extracted_mappings: z.array(extractedMappingSchema),
});
export type ExtractMappingsResult = z.infer<typeof extractMappingsSchema>;
