# @animood-tools/image-gen

Standalone tool. Generates AniMood's atmospheric / mood / mascot art via OpenAI's `gpt-image-1`. Per [[animood-image-policy]], used ONLY for non-anime-character art (hero backgrounds, mood scenes, generic mascot characters). Never for variations of copyrighted anime characters.

## Usage

```bash
cd tools/image-gen
pnpm install
OPENAI_API_KEY=... node generate.mjs \
  --out ../../apps/web/public/generated/hero.png \
  --size 1536x1024 \
  --quality high \
  --prompt "<prompt>"
```

## Cost

`gpt-image-1` standard quality ≈ $0.04/image. HD ≈ $0.16. Budget cap is ₹500/month (animood-image-policy.md).

## Outputs

Drop generated assets into `apps/web/public/generated/`. Those files are committed to git so we don't regenerate on every deploy.
