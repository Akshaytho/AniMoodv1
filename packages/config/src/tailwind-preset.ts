import type { Config } from 'tailwindcss';
import { color, space, radius, shadow, font, breakpoint, layout } from './tokens';

/**
 * Tailwind preset consumed by every app's tailwind.config.ts. Tokens flow
 * through here so changing a value in tokens.ts updates every app on next
 * build.
 */
const preset: Partial<Config> = {
  theme: {
    screens: breakpoint,
    extend: {
      colors: {
        bg: color.bg,
        surface: color.surface,
        'surface-2': color.surface2,
        'surface-3': color.surface3,
        border: color.border,
        'border-strong': color.borderStrong,
        text: color.text,
        muted: color.textMuted,
        faint: color.textFaint,
        accent: color.accent,
        'accent-soft': color.accentSoft,
        'accent-deep': color.accentDeep,
        success: color.success,
        'success-soft': color.successSoft,
        warning: color.warning,
        'warning-soft': color.warningSoft,
        danger: color.danger,
        'danger-soft': color.dangerSoft,
        // Emotion palette
        'emotion-loneliness': color.emotion.loneliness,
        'emotion-healing': color.emotion.healing,
        'emotion-revenge': color.emotion.revenge,
        'emotion-redemption': color.emotion.redemption,
        'emotion-ambition': color.emotion.ambition,
        'emotion-grief': color.emotion.grief,
        'emotion-hope': color.emotion.hope,
        'emotion-existential': color.emotion.existential,
        'emotion-peace': color.emotion.peace,
        'emotion-devastation': color.emotion.devastation,
        'emotion-identity': color.emotion.identity,
        'emotion-moral': color.emotion.moralAmbiguity,
        'emotion-burnout': color.emotion.burnout,
        'emotion-rebuilding': color.emotion.rebuilding,
        'emotion-nostalgia': color.emotion.nostalgia,
        'emotion-freedom': color.emotion.freedom,
      },
      spacing: space,
      borderRadius: radius,
      boxShadow: shadow,
      fontFamily: {
        sans: font.family.sans.split(','),
        display: font.family.display.split(','),
        mono: font.family.mono.split(','),
      },
      fontSize: font.size,
      lineHeight: font.lineHeight,
      fontWeight: font.weight,
      width: { sidebar: layout.sidebarWidth, 'right-rail': layout.rightRailWidth },
      height: { topbar: layout.topbarHeight },
      maxWidth: { content: layout.maxContentWidth },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(60% 80% at 50% 100%, rgba(124,92,255,0.35) 0%, rgba(124,92,255,0) 60%)',
        'accent-rim':
          'linear-gradient(135deg, rgba(124,92,255,0.45) 0%, rgba(124,92,255,0) 50%)',
      },
    },
  },
  plugins: [],
};

export default preset;
