import clsx, { type ClassValue } from 'clsx';

/** Tiny re-export so consumers don't all need to add clsx. */
export const cx = (...args: ClassValue[]): string => clsx(...args);
