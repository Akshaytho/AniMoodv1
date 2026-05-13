import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = resolve(__dirname, '..', 'prompts');

export interface LoadedPrompt {
  name: string;
  system: string;
  user: string;
}

export type PromptName =
  | 'paraphrase-signal'
  | 'emotional-extraction'
  | 'page-draft-generation';

/**
 * Loads a prompt file split into SYSTEM and USER blocks. The file format is:
 *
 *     SYSTEM:
 *     <system block>
 *
 *     USER:
 *     <user block>
 *
 * `{{placeholders}}` are left untouched here — callers substitute them.
 */
export function loadPrompt(name: PromptName): LoadedPrompt {
  const path = resolve(PROMPTS_DIR, `${name}.md`);
  const raw = readFileSync(path, 'utf8');
  const sysIdx = raw.indexOf('SYSTEM:');
  const userIdx = raw.indexOf('USER:');
  if (sysIdx === -1 || userIdx === -1 || userIdx < sysIdx) {
    throw new Error(`Prompt file ${name}.md missing SYSTEM:/USER: markers`);
  }
  const system = raw.slice(sysIdx + 'SYSTEM:'.length, userIdx).trim();
  const user = raw.slice(userIdx + 'USER:'.length).trim();
  if (system.length === 0 || user.length === 0) {
    throw new Error(`Prompt file ${name}.md has empty SYSTEM or USER block`);
  }
  return { name, system, user };
}

/**
 * Substitute `{{key}}` placeholders. Unmatched placeholders throw — we don't
 * silently leak template literals to the model.
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key: string) => {
    if (!(key in values)) {
      throw new Error(`Template placeholder {{${key}}} has no value`);
    }
    return String(values[key]);
  });
}
