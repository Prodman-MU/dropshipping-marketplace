'use client';

import posthog from 'posthog-js';
import Clarity from '@microsoft/clarity';

/**
 * Capture a custom product, conversion, or interaction event across PostHog and Microsoft Clarity.
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  try {
    // PostHog Event Capture
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture(eventName, properties);
    }

    // Microsoft Clarity Custom Event
    if (process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) {
      Clarity.event(eventName);
    }
  } catch (error) {
    console.error(`[Analytics] Failed to track event: ${eventName}`, error);
  }
}

/**
 * Identify an authenticated user or merchant across PostHog and Microsoft Clarity.
 */
export function identifyUser(
  userId: string,
  traits?: {
    email?: string;
    role?: 'admin' | 'merchant' | 'buyer';
    storeId?: string;
    [key: string]: any;
  }
): void {
  if (typeof window === 'undefined') return;

  try {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.identify(userId, traits);
    }

    if (process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) {
      Clarity.identify(userId, undefined, undefined, traits?.email || userId);
    }
  } catch (error) {
    console.error(`[Analytics] Failed to identify user: ${userId}`, error);
  }
}

/**
 * Reset user identity on sign out.
 */
export function resetUserIdentity(): void {
  if (typeof window === 'undefined') return;

  try {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.reset();
    }
  } catch (error) {
    console.error('[Analytics] Failed to reset user identity', error);
  }
}
