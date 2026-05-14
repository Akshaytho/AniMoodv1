import type { Config } from 'tailwindcss';
import { tailwindPreset } from '@animood/config';

const config: Config = {
  presets: [tailwindPreset as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  plugins: [],
};

export default config;
