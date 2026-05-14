import type { ReactNode } from 'react';
import {
  IconHome,
  IconSparkles,
  IconMap,
  IconUsers,
  IconMessageCircle,
  IconScale,
  IconUser,
  IconBookmark,
  IconClock,
} from './icons';

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

export const NAV_SECTIONS: Array<{ title?: string; items: NavItem[] }> = [
  {
    items: [
      { label: 'Home', href: '/', icon: <IconHome /> },
      { label: 'Discover by Emotion', href: '/discover', icon: <IconSparkles /> },
      { label: 'Emotional Map', href: '/map', icon: <IconMap /> },
      { label: 'Character Graph', href: '/characters', icon: <IconUsers /> },
      { label: 'Community', href: '/community', icon: <IconMessageCircle /> },
      { label: 'Opinions', href: '/opinions', icon: <IconScale /> },
    ],
  },
  {
    title: 'You',
    items: [
      { label: 'My Profile', href: '/profile', icon: <IconUser /> },
      { label: 'Saved', href: '/saved', icon: <IconBookmark /> },
      { label: 'History', href: '/history', icon: <IconClock /> },
    ],
  },
];

export interface MoodPill {
  slug: string;
  label: string;
  emoji: string;
}

export const MOOD_PILLS: MoodPill[] = [
  { slug: 'sad', label: 'Feeling Sad', emoji: '🥺' },
  { slug: 'motivation', label: 'Need Motivation', emoji: '🔥' },
  { slug: 'lonely', label: 'Lonely', emoji: '🌙' },
  { slug: 'overwhelmed', label: 'Overwhelmed', emoji: '🌊' },
  { slug: 'peace', label: 'Want peace', emoji: '🍃' },
  { slug: 'heartbroken', label: 'Heartbroken', emoji: '💔' },
  { slug: 'existential', label: 'Existential', emoji: '🪐' },
  { slug: 'curious', label: 'Curious', emoji: '✨' },
];
