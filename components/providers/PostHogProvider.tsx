'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

/**
 * Client component that listens to App Router navigation changes
 * and sends pageview events to PostHog.
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      let url = window.origin + pathname;
      const search = searchParams?.toString();
      if (search) {
        url += `?${search}`;
      }

      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export interface PostHogProviderProps {
  children: React.ReactNode;
}

/**
 * Initializes PostHog analytics and captures pageviews on client transitions.
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (typeof window !== 'undefined' && posthogKey) {
      posthog.init(posthogKey, {
        api_host: '/ingest',
        ui_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: false, // Pageviews are captured manually via PostHogPageView
        capture_pageleave: true,
        debug: process.env.NODE_ENV === 'development', // Logs events to console in development
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
