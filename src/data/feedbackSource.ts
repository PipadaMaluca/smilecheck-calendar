import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchRatingSummary,
  fetchReceivedFeedback,
  seededProfileIdFor,
  type ReceivedFeedbackRow,
} from '@/data/feedbackWrites';

export interface RealRatingData {
  average: number | null;
  count: number;
  reviews: ReceivedFeedbackRow[];
}

const EMPTY: RealRatingData = { average: null, count: 0, reviews: [] };

/**
 * Real (DB) rating + reviews for a profile. Returns an empty result in demo
 * mode or without a session, so callers keep their mock values untouched.
 */
export function useRealRating(profileId: string | null): RealRatingData {
  const { demoMode, user } = useAuth();
  const [data, setData] = useState<RealRatingData>(EMPTY);
  const enabled = !demoMode && !!user && !!profileId;

  useEffect(() => {
    if (!enabled || !profileId) {
      setData(EMPTY);
      return;
    }
    let cancelled = false;
    void Promise.all([fetchRatingSummary(profileId), fetchReceivedFeedback(profileId)]).then(
      ([summary, reviews]) => {
        if (cancelled) return;
        setData({ average: summary.average, count: summary.count, reviews });
      }
    );
    return () => { cancelled = true; };
  }, [enabled, profileId]);

  return data;
}

/** Same as `useRealRating`, keyed by the mock dentist/clinic id. */
export function useRealRatingForMockId(
  role: 'dentist' | 'clinic',
  mockId: string | undefined
): RealRatingData {
  const { demoMode, user } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode || !user || !mockId) {
      setProfileId(null);
      return;
    }
    let cancelled = false;
    void seededProfileIdFor(role, mockId).then((id) => {
      if (!cancelled) setProfileId(id);
    });
    return () => { cancelled = true; };
  }, [demoMode, user, role, mockId]);

  return useRealRating(profileId);
}
