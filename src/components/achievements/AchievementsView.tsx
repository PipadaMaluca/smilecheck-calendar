import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, HelpCircle, Star as StarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserRole } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Achievement, AchievementCategory, getBadgeTier, BADGE_TIER_STYLES, DEFAULT_SHOWCASED } from './achievementData';
import { BadgeSelectionModal } from './BadgeSelectionModal';
import { toast } from 'sonner';

interface AchievementsViewProps {
  userRole: UserRole;
}

// Achievement data uses i18n keys instead of hardcoded text
interface AchievementDef {
  id: string;
  emoji: string;
  nameKey: string;
  descKey: string;
  points: number;
  unlocked: boolean;
  progress?: { current: number; target: number };
  secret?: boolean;
}

interface CategoryDef {
  titleKey: string;
  achievements: AchievementDef[];
}

const patientDefs: CategoryDef[] = [
  {
    titleKey: 'achievements.cat.firstSteps',
    achievements: [
      { id: 'p1', emoji: '📱', nameKey: 'achievements.patient.p1.name', descKey: 'achievements.patient.p1.desc', points: 2, unlocked: true },
      { id: 'p2', emoji: '🎓', nameKey: 'achievements.patient.p2.name', descKey: 'achievements.patient.p2.desc', points: 2, unlocked: true },
      { id: 'p3', emoji: '📝', nameKey: 'achievements.patient.p3.name', descKey: 'achievements.patient.p3.desc', points: 3, unlocked: true },
      { id: 'p4', emoji: '🌟', nameKey: 'achievements.patient.p4.name', descKey: 'achievements.patient.p4.desc', points: 5, unlocked: true },
      { id: 'p5', emoji: '👨‍👩‍👧', nameKey: 'achievements.patient.p5.name', descKey: 'achievements.patient.p5.desc', points: 5, unlocked: false },
      { id: 'p6', emoji: '🦷', nameKey: 'achievements.patient.p6.name', descKey: 'achievements.patient.p6.desc', points: 10, unlocked: true },
    ],
  },
  {
    titleKey: 'achievements.cat.consultations',
    achievements: [
      { id: 'c1', emoji: '📹', nameKey: 'achievements.patient.c1.name', descKey: 'achievements.patient.c1.desc', points: 10, unlocked: true },
      { id: 'c2', emoji: '🌅', nameKey: 'achievements.patient.c2.name', descKey: 'achievements.patient.c2.desc', points: 10, unlocked: false, progress: { current: 1, target: 5 } },
      { id: 'c3', emoji: '📅', nameKey: 'achievements.patient.c3.name', descKey: 'achievements.patient.c3.desc', points: 15, unlocked: true, progress: { current: 3, target: 3 } },
      { id: 'c4', emoji: '🏥', nameKey: 'achievements.patient.c4.name', descKey: 'achievements.patient.c4.desc', points: 15, unlocked: false, progress: { current: 1, target: 3 } },
      { id: 'c5', emoji: '🤝', nameKey: 'achievements.patient.c5.name', descKey: 'achievements.patient.c5.desc', points: 20, unlocked: false, progress: { current: 3, target: 5 } },
      { id: 'c6', emoji: '📹', nameKey: 'achievements.patient.c6.name', descKey: 'achievements.patient.c6.desc', points: 20, unlocked: false, progress: { current: 4, target: 10 } },
      { id: 'c7', emoji: '🏃', nameKey: 'achievements.patient.c7.name', descKey: 'achievements.patient.c7.desc', points: 25, unlocked: false, progress: { current: 3, target: 6 } },
      { id: 'c8', emoji: '🌍', nameKey: 'achievements.patient.c8.name', descKey: 'achievements.patient.c8.desc', points: 30, unlocked: false, progress: { current: 1, target: 5 } },
      { id: 'c9', emoji: '💎', nameKey: 'achievements.patient.c9.name', descKey: 'achievements.patient.c9.desc', points: 50, unlocked: false, progress: { current: 3, target: 12 } },
      { id: 'c10', emoji: '🖥️', nameKey: 'achievements.patient.c10.name', descKey: 'achievements.patient.c10.desc', points: 75, unlocked: false, progress: { current: 4, target: 50 } },
    ],
  },
  {
    titleKey: 'achievements.cat.health',
    achievements: [
      { id: 's1', emoji: '🪥', nameKey: 'achievements.patient.s1.name', descKey: 'achievements.patient.s1.desc', points: 10, unlocked: false, progress: { current: 2, target: 5 } },
      { id: 's2', emoji: '⭐', nameKey: 'achievements.patient.s2.name', descKey: 'achievements.patient.s2.desc', points: 10, unlocked: false, progress: { current: 2, target: 5 } },
      { id: 's3', emoji: '⏰', nameKey: 'achievements.patient.s3.name', descKey: 'achievements.patient.s3.desc', points: 15, unlocked: false, progress: { current: 6, target: 10 } },
      { id: 's4', emoji: '🦷', nameKey: 'achievements.patient.s4.name', descKey: 'achievements.patient.s4.desc', points: 15, unlocked: false, progress: { current: 2, target: 3 } },
      { id: 's5', emoji: '📝', nameKey: 'achievements.patient.s5.name', descKey: 'achievements.patient.s5.desc', points: 20, unlocked: false, progress: { current: 2, target: 20 } },
      { id: 's6', emoji: '🌟', nameKey: 'achievements.patient.s6.name', descKey: 'achievements.patient.s6.desc', points: 20, unlocked: false, progress: { current: 4, target: 10 } },
      { id: 's7', emoji: '✨', nameKey: 'achievements.patient.s7.name', descKey: 'achievements.patient.s7.desc', points: 30, unlocked: false, progress: { current: 2, target: 6 } },
      { id: 's8', emoji: '🏆', nameKey: 'achievements.patient.s8.name', descKey: 'achievements.patient.s8.desc', points: 50, unlocked: false, progress: { current: 2, target: 50 } },
    ],
  },
  {
    titleKey: 'achievements.cat.social',
    achievements: [
      { id: 'so1', emoji: '💬', nameKey: 'achievements.patient.so1.name', descKey: 'achievements.patient.so1.desc', points: 5, unlocked: true },
      { id: 'so2', emoji: '❤️', nameKey: 'achievements.patient.so2.name', descKey: 'achievements.patient.so2.desc', points: 5, unlocked: true },
      { id: 'so3', emoji: '🌐', nameKey: 'achievements.patient.so3.name', descKey: 'achievements.patient.so3.desc', points: 10, unlocked: false, progress: { current: 2, target: 5 } },
      { id: 'so4', emoji: '🗣️', nameKey: 'achievements.patient.so4.name', descKey: 'achievements.patient.so4.desc', points: 15, unlocked: false, progress: { current: 12, target: 50 } },
      { id: 'so5', emoji: '📣', nameKey: 'achievements.patient.so5.name', descKey: 'achievements.patient.so5.desc', points: 30, unlocked: false, progress: { current: 1, target: 5 } },
    ],
  },
  {
    titleKey: 'achievements.cat.loyalty',
    achievements: [
      { id: 'f1', emoji: '🔥', nameKey: 'achievements.patient.f1.name', descKey: 'achievements.patient.f1.desc', points: 10, unlocked: true, progress: { current: 7, target: 7 } },
      { id: 'f2', emoji: '🔥', nameKey: 'achievements.patient.f2.name', descKey: 'achievements.patient.f2.desc', points: 20, unlocked: false, progress: { current: 12, target: 30 } },
      { id: 'f3', emoji: '🎂', nameKey: 'achievements.patient.f3.name', descKey: 'achievements.patient.f3.desc', points: 25, unlocked: false, progress: { current: 4, target: 12 } },
      { id: 'f4', emoji: '🔥', nameKey: 'achievements.patient.f4.name', descKey: 'achievements.patient.f4.desc', points: 40, unlocked: false, progress: { current: 12, target: 90 } },
      { id: 'f5', emoji: '🎖️', nameKey: 'achievements.patient.f5.name', descKey: 'achievements.patient.f5.desc', points: 50, unlocked: false, progress: { current: 4, target: 24 } },
    ],
  },
  {
    titleKey: 'achievements.cat.secrets',
    achievements: [
      { id: 'sec1', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 25, unlocked: false, secret: true },
      { id: 'sec2', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 30, unlocked: false, secret: true },
      { id: 'sec3', emoji: '✨', nameKey: 'achievements.patient.sec3.name', descKey: 'achievements.patient.sec3.desc', points: 50, unlocked: true, secret: true },
      { id: 'sec4', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 50, unlocked: false, secret: true },
      { id: 'sec5', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 75, unlocked: false, secret: true },
      { id: 'sec6', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 100, unlocked: false, secret: true },
    ],
  },
];

const dentistDefs: CategoryDef[] = [
  {
    titleKey: 'achievements.cat.firstSteps',
    achievements: [
      { id: 'dp1', emoji: '📱', nameKey: 'achievements.dentist.dp1.name', descKey: 'achievements.dentist.dp1.desc', points: 3, unlocked: true },
      { id: 'dp2', emoji: '🌟', nameKey: 'achievements.dentist.dp2.name', descKey: 'achievements.dentist.dp2.desc', points: 5, unlocked: true },
      { id: 'dp3', emoji: '📝', nameKey: 'achievements.dentist.dp3.name', descKey: 'achievements.dentist.dp3.desc', points: 5, unlocked: true },
      { id: 'dp4', emoji: '🦷', nameKey: 'achievements.dentist.dp4.name', descKey: 'achievements.dentist.dp4.desc', points: 10, unlocked: true },
    ],
  },
  {
    titleKey: 'achievements.cat.workVolume',
    achievements: [
      { id: 'd1', emoji: '🌙', nameKey: 'achievements.dentist.d1.name', descKey: 'achievements.dentist.d1.desc', points: 20, unlocked: false, progress: { current: 38, target: 50 } },
      { id: 'd2', emoji: '🏅', nameKey: 'achievements.dentist.d2.name', descKey: 'achievements.dentist.d2.desc', points: 25, unlocked: true, progress: { current: 100, target: 100 } },
      { id: 'd3', emoji: '🏋️', nameKey: 'achievements.dentist.d3.name', descKey: 'achievements.dentist.d3.desc', points: 30, unlocked: false, progress: { current: 280, target: 500 } },
      { id: 'd4', emoji: '👨‍⚕️', nameKey: 'achievements.dentist.d4.name', descKey: 'achievements.dentist.d4.desc', points: 30, unlocked: true },
      { id: 'd5', emoji: '🏅', nameKey: 'achievements.dentist.d5.name', descKey: 'achievements.dentist.d5.desc', points: 50, unlocked: false, progress: { current: 127, target: 250 } },
      { id: 'd6', emoji: '🏅', nameKey: 'achievements.dentist.d6.name', descKey: 'achievements.dentist.d6.desc', points: 75, unlocked: false, progress: { current: 127, target: 500 } },
      { id: 'd7', emoji: '👑', nameKey: 'achievements.dentist.d7.name', descKey: 'achievements.dentist.d7.desc', points: 100, unlocked: false, progress: { current: 280, target: 1000 } },
    ],
  },
  {
    titleKey: 'achievements.cat.quality',
    achievements: [
      { id: 'q1', emoji: '📄', nameKey: 'achievements.dentist.q1.name', descKey: 'achievements.dentist.q1.desc', points: 15, unlocked: false, progress: { current: 4, target: 10 } },
      { id: 'q2', emoji: '📋', nameKey: 'achievements.dentist.q2.name', descKey: 'achievements.dentist.q2.desc', points: 15, unlocked: true, progress: { current: 50, target: 50 } },
      { id: 'q3', emoji: '💬', nameKey: 'achievements.dentist.q3.name', descKey: 'achievements.dentist.q3.desc', points: 20, unlocked: true, progress: { current: 100, target: 100 } },
      { id: 'q4', emoji: '💊', nameKey: 'achievements.dentist.q4.name', descKey: 'achievements.dentist.q4.desc', points: 25, unlocked: false, progress: { current: 50, target: 100 } },
      { id: 'q5', emoji: '🎯', nameKey: 'achievements.dentist.q5.name', descKey: 'achievements.dentist.q5.desc', points: 30, unlocked: false },
      { id: 'q6', emoji: '⭐', nameKey: 'achievements.dentist.q6.name', descKey: 'achievements.dentist.q6.desc', points: 40, unlocked: true },
    ],
  },
  {
    titleKey: 'achievements.cat.rankings',
    achievements: [
      { id: 'r1', emoji: '🏆', nameKey: 'achievements.dentist.r1.name', descKey: 'achievements.dentist.r1.desc', points: 30, unlocked: true },
      { id: 'r2', emoji: '🏆', nameKey: 'achievements.dentist.r2.name', descKey: 'achievements.dentist.r2.desc', points: 40, unlocked: true },
      { id: 'r3', emoji: '🏆', nameKey: 'achievements.dentist.r3.name', descKey: 'achievements.dentist.r3.desc', points: 75, unlocked: true },
      { id: 'r4', emoji: '👑', nameKey: 'achievements.dentist.r4.name', descKey: 'achievements.dentist.r4.desc', points: 150, unlocked: false },
    ],
  },
  {
    titleKey: 'achievements.cat.consistency',
    achievements: [
      { id: 'cs1', emoji: '🔥', nameKey: 'achievements.dentist.cs1.name', descKey: 'achievements.dentist.cs1.desc', points: 10, unlocked: true, progress: { current: 7, target: 7 } },
      { id: 'cs2', emoji: '🔥', nameKey: 'achievements.dentist.cs2.name', descKey: 'achievements.dentist.cs2.desc', points: 30, unlocked: true, progress: { current: 30, target: 30 } },
      { id: 'cs3', emoji: '🔥', nameKey: 'achievements.dentist.cs3.name', descKey: 'achievements.dentist.cs3.desc', points: 60, unlocked: false, progress: { current: 45, target: 90 } },
      { id: 'cs4', emoji: '🔥', nameKey: 'achievements.dentist.cs4.name', descKey: 'achievements.dentist.cs4.desc', points: 120, unlocked: false, progress: { current: 45, target: 365 } },
    ],
  },
  {
    titleKey: 'achievements.cat.social',
    achievements: [
      { id: 'dso1', emoji: '❤️', nameKey: 'achievements.dentist.dso1.name', descKey: 'achievements.dentist.dso1.desc', points: 5, unlocked: true },
      { id: 'dso2', emoji: '💬', nameKey: 'achievements.dentist.dso2.name', descKey: 'achievements.dentist.dso2.desc', points: 15, unlocked: false, progress: { current: 42, target: 100 } },
      { id: 'dso3', emoji: '🌟', nameKey: 'achievements.dentist.dso3.name', descKey: 'achievements.dentist.dso3.desc', points: 30, unlocked: false, progress: { current: 18, target: 50 } },
    ],
  },
  {
    titleKey: 'achievements.cat.loyalty',
    achievements: [
      { id: 'df1', emoji: '🎂', nameKey: 'achievements.dentist.df1.name', descKey: 'achievements.dentist.df1.desc', points: 20, unlocked: false, progress: { current: 8, target: 12 } },
      { id: 'df2', emoji: '🎖️', nameKey: 'achievements.dentist.df2.name', descKey: 'achievements.dentist.df2.desc', points: 50, unlocked: false, progress: { current: 8, target: 36 } },
      { id: 'df3', emoji: '👑', nameKey: 'achievements.dentist.df3.name', descKey: 'achievements.dentist.df3.desc', points: 100, unlocked: false, progress: { current: 8, target: 60 } },
    ],
  },
  {
    titleKey: 'achievements.cat.teleconsult',
    achievements: [
      { id: 'dt1', emoji: '📹', nameKey: 'achievements.dentist.dt1.name', descKey: 'achievements.dentist.dt1.desc', points: 10, unlocked: true },
      { id: 'dt2', emoji: '📹', nameKey: 'achievements.dentist.dt2.name', descKey: 'achievements.dentist.dt2.desc', points: 30, unlocked: false, progress: { current: 42, target: 100 } },
      { id: 'dt3', emoji: '📹', nameKey: 'achievements.dentist.dt3.name', descKey: 'achievements.dentist.dt3.desc', points: 75, unlocked: false, progress: { current: 42, target: 500 } },
    ],
  },
  {
    titleKey: 'achievements.cat.secrets',
    achievements: [
      { id: 'dsec1', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 50, unlocked: false, secret: true },
      { id: 'dsec2', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 75, unlocked: false, secret: true },
      { id: 'dsec3', emoji: '🔥', nameKey: 'achievements.dentist.dsec3.name', descKey: 'achievements.dentist.dsec3.desc', points: 100, unlocked: true, secret: true },
      { id: 'dsec4', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 100, unlocked: false, secret: true },
      { id: 'dsec5', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 100, unlocked: false, secret: true },
      { id: 'dsec6', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 150, unlocked: false, secret: true },
    ],
  },
];

const clinicDefs: CategoryDef[] = [
  {
    titleKey: 'achievements.cat.foundation',
    achievements: [
      { id: 'cl1', emoji: '📸', nameKey: 'achievements.clinic.cl1.name', descKey: 'achievements.clinic.cl1.desc', points: 5, unlocked: true, progress: { current: 5, target: 5 } },
      { id: 'cl2', emoji: '✅', nameKey: 'achievements.clinic.cl2.name', descKey: 'achievements.clinic.cl2.desc', points: 5, unlocked: true },
      { id: 'cl3', emoji: '💻', nameKey: 'achievements.clinic.cl3.name', descKey: 'achievements.clinic.cl3.desc', points: 10, unlocked: true },
      { id: 'cl4', emoji: '🏥', nameKey: 'achievements.clinic.cl4.name', descKey: 'achievements.clinic.cl4.desc', points: 10, unlocked: true },
      { id: 'cl5', emoji: '📋', nameKey: 'achievements.clinic.cl5.name', descKey: 'achievements.clinic.cl5.desc', points: 10, unlocked: true },
    ],
  },
  {
    titleKey: 'achievements.cat.team',
    achievements: [
      { id: 'eq1', emoji: '👥', nameKey: 'achievements.clinic.eq1.name', descKey: 'achievements.clinic.eq1.desc', points: 15, unlocked: true, progress: { current: 3, target: 3 } },
      { id: 'eq2', emoji: '🔬', nameKey: 'achievements.clinic.eq2.name', descKey: 'achievements.clinic.eq2.desc', points: 20, unlocked: false, progress: { current: 3, target: 5 } },
      { id: 'eq3', emoji: '👥', nameKey: 'achievements.clinic.eq3.name', descKey: 'achievements.clinic.eq3.desc', points: 30, unlocked: true, progress: { current: 7, target: 7 } },
      { id: 'eq4', emoji: '⭐', nameKey: 'achievements.clinic.eq4.name', descKey: 'achievements.clinic.eq4.desc', points: 40, unlocked: false },
      { id: 'eq5', emoji: '👥', nameKey: 'achievements.clinic.eq5.name', descKey: 'achievements.clinic.eq5.desc', points: 60, unlocked: false, progress: { current: 7, target: 15 } },
    ],
  },
  {
    titleKey: 'achievements.cat.volume',
    achievements: [
      { id: 'v1', emoji: '📈', nameKey: 'achievements.clinic.v1.name', descKey: 'achievements.clinic.v1.desc', points: 25, unlocked: true, progress: { current: 1000, target: 1000 } },
      { id: 'v2', emoji: '🚀', nameKey: 'achievements.clinic.v2.name', descKey: 'achievements.clinic.v2.desc', points: 40, unlocked: false, progress: { current: 320, target: 500 } },
      { id: 'v3', emoji: '📈', nameKey: 'achievements.clinic.v3.name', descKey: 'achievements.clinic.v3.desc', points: 50, unlocked: false, progress: { current: 3200, target: 5000 } },
      { id: 'v4', emoji: '📈', nameKey: 'achievements.clinic.v4.name', descKey: 'achievements.clinic.v4.desc', points: 75, unlocked: false, progress: { current: 3200, target: 10000 } },
      { id: 'v5', emoji: '📈', nameKey: 'achievements.clinic.v5.name', descKey: 'achievements.clinic.v5.desc', points: 120, unlocked: false, progress: { current: 3200, target: 25000 } },
    ],
  },
  {
    titleKey: 'achievements.cat.quality',
    achievements: [
      { id: 'cq1', emoji: '⭐', nameKey: 'achievements.clinic.cq1.name', descKey: 'achievements.clinic.cq1.desc', points: 20, unlocked: true },
      { id: 'cq2', emoji: '💬', nameKey: 'achievements.clinic.cq2.name', descKey: 'achievements.clinic.cq2.desc', points: 25, unlocked: true, progress: { current: 100, target: 100 } },
      { id: 'cq3', emoji: '🛡️', nameKey: 'achievements.clinic.cq3.name', descKey: 'achievements.clinic.cq3.desc', points: 35, unlocked: false },
      { id: 'cq4', emoji: '⭐', nameKey: 'achievements.clinic.cq4.name', descKey: 'achievements.clinic.cq4.desc', points: 50, unlocked: true },
      { id: 'cq5', emoji: '⭐', nameKey: 'achievements.clinic.cq5.name', descKey: 'achievements.clinic.cq5.desc', points: 75, unlocked: false },
    ],
  },
  {
    titleKey: 'achievements.cat.rankings',
    achievements: [
      { id: 'cr1', emoji: '🏆', nameKey: 'achievements.clinic.cr1.name', descKey: 'achievements.clinic.cr1.desc', points: 25, unlocked: true },
      { id: 'cr2', emoji: '🏆', nameKey: 'achievements.clinic.cr2.name', descKey: 'achievements.clinic.cr2.desc', points: 60, unlocked: true },
      { id: 'cr3', emoji: '🏆', nameKey: 'achievements.clinic.cr3.name', descKey: 'achievements.clinic.cr3.desc', points: 100, unlocked: true },
      { id: 'cr4', emoji: '👑', nameKey: 'achievements.clinic.cr4.name', descKey: 'achievements.clinic.cr4.desc', points: 200, unlocked: false },
    ],
  },
  {
    titleKey: 'achievements.cat.consistency',
    achievements: [
      { id: 'ccs1', emoji: '🔥', nameKey: 'achievements.clinic.ccs1.name', descKey: 'achievements.clinic.ccs1.desc', points: 15, unlocked: false, progress: { current: 12, target: 30 } },
      { id: 'ccs2', emoji: '🔥', nameKey: 'achievements.clinic.ccs2.name', descKey: 'achievements.clinic.ccs2.desc', points: 35, unlocked: false, progress: { current: 12, target: 90 } },
      { id: 'ccs3', emoji: '🔥', nameKey: 'achievements.clinic.ccs3.name', descKey: 'achievements.clinic.ccs3.desc', points: 80, unlocked: false, progress: { current: 12, target: 365 } },
    ],
  },
  {
    titleKey: 'achievements.cat.loyalty',
    achievements: [
      { id: 'cf1', emoji: '🎂', nameKey: 'achievements.clinic.cf1.name', descKey: 'achievements.clinic.cf1.desc', points: 20, unlocked: false, progress: { current: 6, target: 12 } },
      { id: 'cf2', emoji: '🏛️', nameKey: 'achievements.clinic.cf2.name', descKey: 'achievements.clinic.cf2.desc', points: 50, unlocked: false, progress: { current: 6, target: 36 } },
      { id: 'cf3', emoji: '👑', nameKey: 'achievements.clinic.cf3.name', descKey: 'achievements.clinic.cf3.desc', points: 100, unlocked: false, progress: { current: 6, target: 60 } },
    ],
  },
  {
    titleKey: 'achievements.cat.teleconsult',
    achievements: [
      { id: 'ct1', emoji: '📹', nameKey: 'achievements.clinic.ct1.name', descKey: 'achievements.clinic.ct1.desc', points: 10, unlocked: true },
      { id: 'ct2', emoji: '📹', nameKey: 'achievements.clinic.ct2.name', descKey: 'achievements.clinic.ct2.desc', points: 25, unlocked: false, progress: { current: 45, target: 100 } },
      { id: 'ct3', emoji: '📹', nameKey: 'achievements.clinic.ct3.name', descKey: 'achievements.clinic.ct3.desc', points: 50, unlocked: false, progress: { current: 45, target: 500 } },
      { id: 'ct4', emoji: '📹', nameKey: 'achievements.clinic.ct4.name', descKey: 'achievements.clinic.ct4.desc', points: 100, unlocked: false, progress: { current: 45, target: 1000 } },
    ],
  },
  {
    titleKey: 'achievements.cat.secrets',
    achievements: [
      { id: 'csec1', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 50, unlocked: false, secret: true },
      { id: 'csec2', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 75, unlocked: false, secret: true },
      { id: 'csec3', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 100, unlocked: false, secret: true },
      { id: 'csec4', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 100, unlocked: false, secret: true },
      { id: 'csec5', emoji: '🏆', nameKey: 'achievements.clinic.csec5.name', descKey: 'achievements.clinic.csec5.desc', points: 150, unlocked: true, secret: true },
      { id: 'csec6', emoji: '❓', nameKey: '???', descKey: 'achievements.secretAchievement', points: 200, unlocked: false, secret: true },
    ],
  },
];

function resolveCategories(defs: CategoryDef[], t: (key: string) => string): AchievementCategory[] {
  return defs.map(cat => ({
    title: t(cat.titleKey),
    achievements: cat.achievements.map(a => ({
      id: a.id,
      emoji: a.emoji,
      name: a.nameKey === '???' ? '???' : t(a.nameKey),
      description: t(a.descKey),
      points: a.points,
      unlocked: a.unlocked,
      progress: a.progress,
      secret: a.secret,
    })),
  }));
}

// Keep exports for other components that use these
export const patientAchievements: AchievementCategory[] = []; // Will be resolved at render time
export const dentistAchievements: AchievementCategory[] = [];
export const clinicAchievements: AchievementCategory[] = [];

function AchievementCard({ achievement, isShowcased, onClickCompleted }: { achievement: Achievement; isShowcased?: boolean; onClickCompleted?: () => void }) {
  const { t } = useTranslation();
  const isSecret = achievement.secret && !achievement.unlocked;
  const tier = getBadgeTier(achievement);
  const tierStyle = BADGE_TIER_STYLES[tier];

  return (
    <Card
      className={cn(
        'bg-card/80 backdrop-blur border-border transition-all duration-300 relative',
        achievement.unlocked
          ? 'ring-1 ring-primary/20 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10 cursor-pointer'
          : 'opacity-60'
      )}
      onClick={achievement.unlocked && onClickCompleted ? onClickCompleted : undefined}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
            isSecret ? 'bg-purple-500/10 shadow-[0_0_8px_hsl(270,60%,50%,0.15)]' : achievement.unlocked ? 'bg-primary/10' : 'bg-muted'
          )}>
            {isSecret ? (
              <HelpCircle className="w-5 h-5 text-purple-400" />
            ) : (
              achievement.emoji
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn(
                'text-sm font-medium truncate',
                achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {isSecret ? '???' : achievement.name}
              </p>
              {achievement.unlocked && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                  ✓
                </span>
              )}
              <span className={cn(
                'text-[10px] font-bold ml-auto flex-shrink-0',
                achievement.unlocked ? 'text-amber-400' : 'text-muted-foreground'
              )}>
                +{achievement.points} pts
              </span>
              {isShowcased && (
                <span className="text-amber-400 text-xs flex-shrink-0">⭐</span>
              )}
              {!achievement.unlocked && !isSecret && (
                <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isSecret ? t('achievements.secret') : achievement.description}
            </p>
            {achievement.progress && !isSecret && (
              <div className="mt-2">
                <Progress
                  value={Math.min((achievement.progress.current / achievement.progress.target) * 100, 100)}
                  className={cn('h-1.5', achievement.unlocked && 'bg-emerald-900/30 [&>div]:bg-emerald-500')}
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {achievement.progress.current}/{achievement.progress.target}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function getAchievementCategories(userRole: UserRole, t?: (key: string) => string): AchievementCategory[] {
  if (!t) {
    // Fallback - should not happen in practice
    return [];
  }
  const defs = userRole === 'patient' ? patientDefs : userRole === 'dentist' ? dentistDefs : clinicDefs;
  return resolveCategories(defs, t);
}

export function AchievementsView({ userRole }: AchievementsViewProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [showManageModal, setShowManageModal] = useState(false);
  const [showcasedIds, setShowcasedIds] = useState<string[]>(DEFAULT_SHOWCASED[userRole] || []);
  const [addToShowcaseTarget, setAddToShowcaseTarget] = useState<Achievement | null>(null);

  const categories = getAchievementCategories(userRole, t);

  const totalAchievements = categories.reduce((sum, cat) => sum + cat.achievements.length, 0);
  const unlockedAchievements = categories.reduce(
    (sum, cat) => sum + cat.achievements.filter(a => a.unlocked).length, 0
  );
  const progressPercent = Math.round((unlockedAchievements / totalAchievements) * 100);

  const completedCategories = categories.map(cat => ({
    ...cat,
    achievements: cat.achievements.filter(a => a.unlocked),
  })).filter(cat => cat.achievements.length > 0);

  const handleClickCompleted = (ach: Achievement) => {
    if (showcasedIds.includes(ach.id)) {
      setShowcasedIds(prev => prev.filter(id => id !== ach.id));
      toast.info(`"${ach.name}" ${t('achievements.removedFromShowcase')}`);
    } else if (showcasedIds.length < 8) {
      setShowcasedIds(prev => [...prev, ach.id]);
      toast.success(`✅ "${ach.name}" ${t('achievements.addedToShowcase')}`);
    } else {
      setAddToShowcaseTarget(ach);
      setShowManageModal(true);
    }
  };

  const secretsTitle = t('achievements.cat.secrets');

  const renderAchievementGrid = (cats: AchievementCategory[], showClickHandler: boolean) => (
    <>
      {cats.map(category => {
        const isSecretsSection = category.title === secretsTitle;
        if (!isSecretsSection) {
          const hasVisible = category.achievements.some(a => !a.secret || a.unlocked);
          if (!hasVisible) return null;
        }
        return (
          <div key={category.title}>
            <Separator className="mb-4" />
            {isSecretsSection ? (
              <div className="mb-3 p-4 rounded-lg bg-gradient-to-r from-purple-900/40 via-slate-900/50 to-purple-800/30 border border-purple-500/30 shadow-[0_0_15px_hsl(270,60%,50%,0.1)]">
                <h2 className="text-base font-semibold text-foreground">🔮 {t('achievements.secrets')}</h2>
                <p className="text-xs text-purple-300/70 mt-0.5">{t('achievements.secretsDesc')}</p>
              </div>
            ) : (
              <h2 className="text-base font-semibold text-foreground mb-3">{category.title}</h2>
            )}
            <div className={cn(
              'grid gap-3',
              isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
            )}>
              {category.achievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isShowcased={showcasedIds.includes(achievement.id)}
                  onClickCompleted={showClickHandler && achievement.unlocked ? () => handleClickCompleted(achievement) : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-32">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('achievements.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {unlockedAchievements} {t('achievements.of')} {totalAchievements} {t('achievements.unlocked')}
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs flex-shrink-0" onClick={() => setShowManageModal(true)}>
            <StarIcon className="w-3.5 h-3.5" /> {t('achievements.manageShowcase')}
          </Button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{t('achievements.overallProgress')}</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="todas" className="flex-1">{t('achievements.all')}</TabsTrigger>
            <TabsTrigger value="completas" className="flex-1">{t('achievements.completed')} ({unlockedAchievements})</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-0 mt-4">
            {renderAchievementGrid(categories, false)}
          </TabsContent>

          <TabsContent value="completas" className="space-y-0 mt-4">
            {completedCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">{t('achievements.noUnlocked')}</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-4">
                  {t('achievements.clickToManage')}
                </p>
                {renderAchievementGrid(completedCategories, true)}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Badge Selection Modal */}
      <BadgeSelectionModal
        open={showManageModal}
        onOpenChange={setShowManageModal}
        categories={categories}
        selectedIds={showcasedIds}
        onSave={setShowcasedIds}
      />
    </ScrollArea>
  );
}
