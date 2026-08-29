import { describe, it, expect, vi, beforeEach } from 'vitest';
import posthog from 'posthog-js';
import Clarity from '@microsoft/clarity';
import { trackEvent, identifyUser, resetUserIdentity } from '@/lib/analytics';

vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

vi.mock('@microsoft/clarity', () => ({
  default: {
    event: vi.fn(),
    identify: vi.fn(),
    init: vi.fn(),
  },
}));

describe('lib/analytics', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_POSTHOG_KEY: 'test-ph-key',
      NEXT_PUBLIC_CLARITY_PROJECT_ID: 'test-clarity-id',
    };
  });

  it('captures events in both PostHog and Clarity when keys are present', () => {
    trackEvent('product_viewed', { productId: 'p123', price: 99 });

    expect(posthog.capture).toHaveBeenCalledWith('product_viewed', {
      productId: 'p123',
      price: 99,
    });
    expect(Clarity.event).toHaveBeenCalledWith('product_viewed');
  });

  it('identifies user across PostHog and Clarity', () => {
    identifyUser('user-456', { email: 'vendor@example.com', role: 'merchant' });

    expect(posthog.identify).toHaveBeenCalledWith('user-456', {
      email: 'vendor@example.com',
      role: 'merchant',
    });
    expect(Clarity.identify).toHaveBeenCalledWith(
      'user-456',
      undefined,
      undefined,
      'vendor@example.com'
    );
  });

  it('resets user identity in PostHog', () => {
    resetUserIdentity();
    expect(posthog.reset).toHaveBeenCalled();
  });
});
