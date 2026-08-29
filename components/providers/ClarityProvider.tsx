'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

/**
 * Initializes Microsoft Clarity tracking when NEXT_PUBLIC_CLARITY_PROJECT_ID is provided.
 */
export function ClarityProvider() {
  useEffect(() => {
    const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

    if (typeof window !== 'undefined' && clarityProjectId) {
      Clarity.init(clarityProjectId);
    }
  }, []);

  return null;
}
