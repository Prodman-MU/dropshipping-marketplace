'use client';

import { ReactNode } from 'react';
import { PostHogProvider } from './PostHogProvider';
import { ClarityProvider } from './ClarityProvider';

export interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Unified Analytics Provider integrating PostHog and Microsoft Clarity.
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <PostHogProvider>
      <ClarityProvider />
      {children}
    </PostHogProvider>
  );
}
