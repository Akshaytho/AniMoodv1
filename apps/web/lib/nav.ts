import type { ReactNode } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

export const NAV_SECTIONS: Array<{ title?: string; items: NavItem[] }> = [
  {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Discover by Emotion', href: '/discover' },
      { label: 'Emotional Map', href: '/map' },
      { label: 'Character Graph', href: '/characters' },
      { label: 'Community', href: '/community' },
      { label: 'Opinions', href: '/opinions' },
    ],
  },
  {
    title: 'You',
    items: [
      { label: 'My Profile', href: '/profile' },
      { label: 'Saved', href: '/saved' },
      { label: 'History', href: '/history' },
    ],
  },
];

export const MOOD_PILLS: Array<{ slug: string; label: string }> = [
  { slug: 'sad', label: 'Feeling Sad' },
  { slug: 'motivation', label: 'Need Motivation' },
  { slug: 'lonely', label: 'Lonely' },
  { slug: 'overwhelmed', label: 'Overwhelmed' },
  { slug: 'peace', label: 'Want peace' },
  { slug: 'heartbroken', label: 'Heartbroken' },
  { slug: 'existential', label: 'Existential' },
  { slug: 'curious', label: 'Curious' },
];
